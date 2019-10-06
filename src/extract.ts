import { logger } from './logger'
import { launchBrowser } from './launchBrowser'
import { getText } from './utils'

const url = 'http://dgp.cnpq.br/dgp/faces/consulta/consulta_parametrizada.jsf'
const checkboxSelector = (i: number) => `#idFormConsultaParametrizada\\:campos\\:${i}`
const buttonSelector = '#idFormConsultaParametrizada\\:idPesquisar'

const groupSelector = (i: number) => `#idFormConsultaParametrizada\\:resultadoDataList\\:${i}\\:idBtnVisualizarEspelhoGrupo`

const emailSelector = '#endereco > fieldset > div:nth-child(17) > div > a'

const searchBoxSelector = '#idFormConsultaParametrizada\\:idTextoFiltro'
export const extract = async (group: string) => {
  logger.info(`Extracting group ${group || 'ALL'}`)
  const { browser, page } = await launchBrowser()

  await page.goto(url)
  const input = await page.waitForSelector(searchBoxSelector, { timeout: 5000 })
  await input.type(group)

  await page.click(checkboxSelector(0))
  await page.click(buttonSelector)

  const pageTarget = page.target()
  const groupLink = await page.waitForSelector(groupSelector(0))
  await groupLink.click()
  const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget)

  const newPage = await newTarget.page()
  await newPage.waitForSelector(emailSelector)
  const text = await getText(newPage, emailSelector)

  logger.info(`Email: ${text}`)
}
