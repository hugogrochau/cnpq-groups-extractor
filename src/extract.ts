import { fetchPage } from './fetchPage'
import { logger } from './logger'

const URL = 'http://dgp.cnpq.br/dgp/faces/consulta/consulta_parametrizada.jsf'

export const extract = async (group?: string) => {
  logger.info(`Extracting group ${group || 'ALL'}`)

  const dom = await fetchPage(URL)
  const element = dom.window.document.querySelector('body > div.container > div > div > h1')

  if (!element) {
    throw new Error('Element not found')
  }

  logger.info(element.textContent)
}
