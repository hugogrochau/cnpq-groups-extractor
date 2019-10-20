import { logger } from './logger'
import { launchBrowser } from './launchBrowser'
import { extractFromGroupSearch } from './extractors/extractFromGroupSearch'
import { extractGroupPage } from './extractors/extractGroupPage'

export const launchExtractFromGroupSearch = async (searchQuery: string) => {
  logger.info(`Extracting groups that match search query: ${searchQuery}`)
  const { page, browser } = await launchBrowser()

  const searchUrl = 'http://dgp.cnpq.br/dgp/faces/consulta/consulta_parametrizada.jsf'
  await page.goto(searchUrl)

  await extractFromGroupSearch(page, browser, searchQuery)

  logger.info(`Finished extracting groups that matched search query: ${searchQuery}`)
  await browser.close()
}

export const launchExtractGroupPage = async (group: string) => {
  logger.info(`Extracting group ${group}`)
  const { page, browser } = await launchBrowser()

  await page.goto(`http://dgp.cnpq.br/dgp/espelhogrupo/${group}`)

  await extractGroupPage(page, null)

  logger.info(`Finished extracting group ${group}`)

  await browser.close()
}

export const launchAllGroupsSearch = async () => {
  logger.info('Lauching all groups search')

  const groups = [
    'Ciências Agrárias',
    'Bioquímica',
    'Engenharia Biomédica',
    'Biotecnologia',
    'Botânica',
    'Biologia celular',
    'Ecologia',
    'Endocrinologia',
    'Fisiologia',
    'Genética',
    'Geologia',
    'Ciências do solo',
    'Geografia',
    'Imunologia',
    'Biologia Marinha',
    'Medicina',
    'Microbiologia',
    'Biologia Molecular',
    'Neurociência',
    'Farmacologia',
    'Zoologia'
  ]

  for (const group of groups) {
    await launchExtractFromGroupSearch(group)
  }
}
