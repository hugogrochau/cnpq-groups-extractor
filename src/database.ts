import { logger } from './logger'

export interface Group {
  title: string,
  url: string,
  shortId: number,
  longId: number,
  certified: boolean,
  creationYear: number,
  situationDate: Date,
  lastUpdateDate: Date,
  leader1: string,
  leader2: string | null,
  areas: string,
  institution: string,
  unit: string,
  addressPlace: string,
  addressNumber: string,
  addressComplement: string,
  addressNeighborhood: string,
  addressUf: string,
  addressLocation: string,
  addressCep: string,
  addressPostbox: string,
  locationLatitude: number | null,
  locationLongitude: number | null,
  contactPhone: string,
  contactFax: string,
  contactEmail: string,
  contactWebsite: string,
  repercussions: string,
}


export const saveGroup = async (group: Group) => {
  logger.info(`Saving group ${group.title} to database`)
  console.log(group)
}