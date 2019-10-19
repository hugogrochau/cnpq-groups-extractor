import * as R from 'ramda'
import { logger } from '../logger'
import { launchBrowser } from '../launchBrowser'
import { getText } from '../utils'
import { Page, Browser, ElementHandle } from 'puppeteer'

export const extractFromGroupSearch = async (searchQuery: string) => {
  logger.info(`Extracting groups that match search query: ${searchQuery}`)
  const { page, browser } = await launchBrowser()

  await executeSearch(page, searchQuery)

  await increaseResultsPerPage(page)

  extractGroupsInformation(page, browser)
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
  await selector.select('100')
}

const extractGroupsInformation = async (page: Page, browser: Browser) => {
  const numberOfResults = await getNumberOfResults(page)
  logger.info(`Extracting ${numberOfResults} groups`)

  const divisor = Math.floor(numberOfResults / 100)
  const remainder = numberOfResults % 100
  const resultsPerPage = R.repeat(100, divisor)
  if (remainder > 0) {
    resultsPerPage.push(remainder)
  }

  for (const resultsInPage of resultsPerPage) {
    logger.info(`Extracting ${resultsInPage} from page`)
    await extractGroupsFromResultPage(page, browser)
    await goToNextResultPage(page)
  }
}

const goToNextResultPage = async (page: Page) => {
  const nextPageButtonSelector = '#idFormConsultaParametrizada\\:resultadoDataList_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all > span'
  await page.click(nextPageButtonSelector)
}

const extractGroupsFromResultPage = async (page: Page, browser: Browser) => {
  const loadingSelector = '#j_idt34[aria-hidden=\'true\']'
  await page.waitForSelector(loadingSelector)

  const resultsSelector = '#idFormConsultaParametrizada\\:resultadoDataList_list > li'
  const resultElements = await page.$$(resultsSelector)

  for (const resultElement of resultElements) {
    const newPagePromise: Promise<Page> = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())))
    await openPage(page, resultElement)
    const popup = await newPagePromise
    const url = popup.url()
    const email = await extractEmail(popup)
    await popup.close()
    console.log({ url, email })
  }
}

const openPage = async (page: Page, resultElement: ElementHandle<Element>) => {
  await page.bringToFront()
  const groupLinkSelector = '.itemConsulta .control-group:nth-child(1) a'
  const groupLinkEl = await resultElement.$(groupLinkSelector)

  if (!groupLinkEl) {
    throw new Error('Could\'t click element')
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
  // const groupLink = await page.waitForSelector(groupSelector(0))
  // await groupLink.click()

  const emailSelector = '#endereco > fieldset > div:nth-child(17) > div > a'
  await page.waitForSelector(emailSelector)
  const emailText = await getText(page, emailSelector)

  return emailText
}
