import * as R from 'ramda'
import { logger } from '../logger'
import { launchBrowser } from '../launchBrowser'
import { getText, timeout } from '../utils'
import { Page, Browser, ElementHandle } from 'puppeteer'

const numberOfResultsPerPage = 25

export const extractFromGroupSearch = async (searchQuery: string) => {
  logger.info(`Extracting groups that match search query: ${searchQuery}`)
  const { page, browser } = await launchBrowser()

  await executeSearch(page, searchQuery)

  await increaseResultsPerPage(page)

  await extractGroupsInformation(page, browser)

  logger.info('Finished extracting groups')
  await browser.close()
}

const executeSearch = async (page: Page, searchQuery: string) => {
  const checkboxSelector = (i: number) => `#idFormConsultaParametrizada\\:campos\\:${i}`
  const searchUrl = 'http://dgp.cnpq.br/dgp/faces/consulta/consulta_parametrizada.jsf'
  const searchBoxSelector = '#idFormConsultaParametrizada\\:idTextoFiltro'
  const buttonSelector = '#idFormConsultaParametrizada\\:idPesquisar'

  await page.goto(searchUrl)
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

const extractGroupsInformation = async (searchPage: Page, browser: Browser) => {
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

    await extractGroupsFromResultPage(searchPage, browser)

    await goToNextResultPage(searchPage)

    currentPage++
  }
}

const goToNextResultPage = async (searchPage: Page) => {
  await searchPage.bringToFront()
  const nextPageButtonSelector = '#idFormConsultaParametrizada\\:resultadoDataList_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all > span'
  await searchPage.click(nextPageButtonSelector)
}

const extractGroupsFromResultPage = async (searchPage: Page, browser: Browser) => {
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
      await extractGroupPage(browser, resultElement)
    } catch (err) {
      logger.error(`Couldn't extract group: ${groupTitle}. ${err}`)
    }
  }
}

const extractGroupPage = async (browser: Browser, resultElement: ElementHandle<Element>) => {
  const newPagePromise: Promise<Page> = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())))

  await openGroupPage(resultElement)

  const newPage = await timeout(10000, newPagePromise)

  const url = newPage.url()
  const email = await extractEmail(newPage)
  console.log({ url, email })

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

export const extractEmail = async (page: Page): Promise<string> => {
  const emailSelector = '#endereco > fieldset > div:nth-child(17) > div > a'
  await page.waitForSelector(emailSelector)
  const emailText = await getText(page, emailSelector)

  return emailText
}
