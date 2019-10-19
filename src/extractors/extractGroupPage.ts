import { saveGroup } from '../database'
import { Page } from 'puppeteer'
import { getText } from '../utils'

export const extractGroupPage = async (page: Page) => {
  const titleSelector = '#tituloImpressao > h1'
  await page.waitForSelector(titleSelector)

  const url = page.url()
  const title = await getText(page, titleSelector)
  const [leader1, leader2] = await getLeaders(page)

  await saveGroup({
    title,
    url,
    shortId: await getShortId(url),
    longId: await getLongId(page),
    certified: await getIsCertified(page),
    creationYear: await getCreationYear(page),
    situationDate: await getSituationDate(page),
    lastUpdateDate: await getLastUpdateDate(page),
    leader1,
    leader2,
    areas: await getAreas(page),
    institution: await getInstitution(page),
    unit: await getUnit(page),
    addressPlace: await getAddressPlace(page),
    addressNumber: await getAddressNumber(page),
    addressComplement: await getAddressComplement(page),
    addressNeighborhood: await getAddressNeighborhood(page),
    addressUf: await getAddressUf(page),
    addressLocation: await getAddressLocation(page),
    addressCep: await getAddressCep(page),
    addressPostbox: await getAddressPostbox(page),
    locationLatitude: await getLocationLatitude(page) || null,
    locationLongitude: await getLocationLongitude(page) || null,
    contactPhone: await getContactPhone(page),
    contactFax: await getContactFax(page),
    contactEmail: await getContactEmail(page),
    contactWebsite: await getContactWebsite(page),
    repercussions: await getRepercussions(page),
  })
}


export const getLongId = async (page: Page) => {
 const result = await getText(page, '#idFormVisualizarGrupoPesquisa > div > div:nth-child(2)', /Endereço para acessar este espelho: dgp\.cnpq\.br\/dgp\/espelhogrupo\/(\d+)/i)
 return +result
}

export const getShortId = (url: string) => {
  const regex = /http:\/\/dgp\.cnpq\.br\/dgp\/espelhogrupo\/(\d+)/i
  const matchResults = url.match(regex)
  if (!matchResults) {
    throw new Error(`Couldn't find any matches for regex ${regex}`)
  }

  return +matchResults[1].trim()
}

export const getIsCertified = async (page: Page) => {
  const certifiedText = await getText(page, '#identificacao > fieldset > div:nth-child(2) > div')

  return certifiedText === 'Certificado'
}

export const getCreationYear = async (page: Page) => {
  const result = await getText(page, '#identificacao > fieldset > div:nth-child(3) > div')
  return +result
}

export const getSituationDate = async (page: Page) => {
  const result = await getText(page, '#identificacao > fieldset > div:nth-child(4) > div')
  return new Date(Date.parse(result))
}

export const getLastUpdateDate = async (page: Page) => {
  const result = await getText(page, '#identificacao > fieldset > div:nth-child(5) > div')
  return new Date(Date.parse(result))
}

export const getLeaders = async (page: Page): Promise<[string, string | null]> => {
  const result = await getText(page, '#identificacao > fieldset > div:nth-child(6) > div')
  const [leader1, leader2] = result.split('\n').filter(l => !!l)

  return [leader1, leader2 || null]
}

export const getAreas = (page: Page) => getText(page, '#identificacao > fieldset > div:nth-child(7) > div')

export const getInstitution = (page: Page) => getText(page, '#identificacao > fieldset > div:nth-child(8) > div')

export const getUnit = (page: Page) => getText(page, '#identificacao > fieldset > div:nth-child(9) > div')

export const getAddressPlace = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(3) > div')

export const getAddressNumber = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(4) > div')

export const getAddressComplement = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(5) > div')

export const getAddressNeighborhood = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(6) > div')

export const getAddressUf = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(7) > div')

export const getAddressLocation = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(8) > div')

export const getAddressCep = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(9) > div')

export const getAddressPostbox = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(10) > div')

export const getLocationLatitude = async (page: Page) => {
  const result = await getText(page, '#endereco > fieldset > div:nth-child(12) > div')
  return +result
}

export const getLocationLongitude = async (page: Page) => {
  const result = await getText(page, '#endereco > fieldset > div:nth-child(13) > div')
  return +result
}

export const getContactPhone = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(15) > div')

export const getContactFax = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(16) > div')

export const getContactEmail = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(17) > div > a')

export const getContactWebsite = (page: Page) => getText(page, '#endereco > fieldset > div:nth-child(18) > div > a')

export const getRepercussions = (page: Page) => getText(page, '#repercussao > fieldset > p')
