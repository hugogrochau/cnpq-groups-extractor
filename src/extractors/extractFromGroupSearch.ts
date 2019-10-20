import * as R from 'ramda'
import { logger } from '../logger'
import { getText, timeout } from '../utils'
import { Page, Browser, ElementHandle } from 'puppeteer'
import { extractGroupPage } from './extractGroupPage'

const numberOfResultsPerPage = 100

export const extractFromGroupSearch = async (page: Page, browser: Browser, searchQuery: string) => {
  await executeSearch(page, searchQuery)

  await increaseResultsPerPage(page)

  await extractGroupsInformation(page, browser, searchQuery)

  logger.info('Finished extracting groups')
  await browser.close()
}

const executeSearch = async (page: Page, searchQuery: string) => {
  const checkboxSelector = (i: number) => `#idFormConsultaParametrizada\\:campos\\:${i}`

  const searchBoxSelector = '#idFormConsultaParametrizada\\:idTextoFiltro'
  const buttonSelector = '#idFormConsultaParametrizada\\:idPesquisar'

  const input = await page.waitForSelector(searchBoxSelector, { timeout: 5000 })
  await input.type(searchQuery)

  await page.click(checkboxSelector(0))
  await page.click(buttonSelector)
}

const increaseResultsPerPage = async (page: Page) => {
  const paginatorSelector = '#idFormConsultaParametrizada\\:resultadoDataList_paginator_bottom > select'
  const selector = await page.waitForSelector(paginatorSelector)
  await selector.select(`${numberOfResultsPerPage}`)
}

const extractGroupsInformation = async (searchPage: Page, browser: Browser, searchQuery: string) => {
  const numberOfResults = await getNumberOfResults(searchPage)
  logger.info(`Extracting ${numberOfResults} groups`)

  const divisor = Math.floor(numberOfResults / numberOfResultsPerPage)
  const remainder = numberOfResults % numberOfResultsPerPage
  const resultsPerPage = R.repeat(numberOfResultsPerPage, divisor)
  if (remainder > 0) {
    resultsPerPage.push(remainder)
  }

  let currentPage = 1
  for (const resultsInPage of resultsPerPage) {
    logger.info(`Extracting ${resultsInPage} groups from page ${currentPage}`)

    await extractGroupsFromResultPage(searchPage, browser, searchQuery)

    await goToNextResultPage(searchPage)

    currentPage++
  }
}

const goToNextResultPage = async (searchPage: Page) => {
  await searchPage.bringToFront()
  const nextPageButtonSelector = '#idFormConsultaParametrizada\\:resultadoDataList_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all > span'
  await searchPage.click(nextPageButtonSelector)
}

const extractGroupsFromResultPage = async (searchPage: Page, browser: Browser, searchQuery: string) => {
  await searchPage.bringToFront()

  const loadingSelector = '#j_idt34[aria-hidden=\'true\']'
  await searchPage.waitForSelector(loadingSelector)

  const resultsSelector = '#idFormConsultaParametrizada\\:resultadoDataList_list > li'
  const resultElements = await searchPage.$$(resultsSelector)

  for (const resultElement of resultElements) {
    await searchPage.bringToFront()

    const groupTitle = await getGroupTitle(resultElement)
    try {
      logger.info(`Extracting group: ${groupTitle}`)
      await openAndExtractGroupPage(browser, resultElement, searchQuery)
    } catch (err) {
      logger.error(`Couldn't extract group: ${groupTitle}. ${err}`)
    }
  }
}

const openAndExtractGroupPage = async (browser: Browser, resultElement: ElementHandle<Element>, searchQuery: string) => {
  const newPagePromise: Promise<Page> = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())))

  await openGroupPage(resultElement)

  const newPage = await timeout(10000, newPagePromise)

  await extractGroupPage(newPage, searchQuery)

  await newPage.close()
}

const getGroupTitle = async (resultElement: ElementHandle<Element>) => {
  const groupLinkSelector = '.itemConsulta .control-group:nth-child(1) a'
  const groupTitle = await resultElement.$eval(groupLinkSelector, el => el.textContent)
  return groupTitle
}

const openGroupPage = async (resultElement: ElementHandle<Element>) => {
  const groupLinkSelector = '.itemConsulta .control-group:nth-child(1) a'

  const groupLinkEl = await resultElement.$(groupLinkSelector)

  if (!groupLinkEl) {
    const groupTitle = await getGroupTitle(resultElement)
    throw new Error(`Could't click element of group ${groupTitle}`)
  }

  await groupLinkEl.click()
}

export const getNumberOfResults = async (page: Page): Promise<number> => {
  const numberOfResultsSelector = '#idFormConsultaParametrizada\\:resultadoDataList_paginator_bottom > span.ui-paginator-current'
  const totalNumberRegex = /Total de registros: (\d+)/i
  await page.waitForSelector(numberOfResultsSelector)
  const numberOfResults = await getText(page, numberOfResultsSelector, totalNumberRegex)

  return +numberOfResults
}
