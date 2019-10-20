import { logger } from './logger'
import * as sqlite from 'sqlite'
import { SQL } from 'sql-template-strings'

let db: sqlite.Database

export const initDb = async () => {
  db = await sqlite.open('./database.sqlite')
  await db.migrate({})
}

export const closeDb = async () => {
  await db.close()
}

export interface Group {
  title: string,
  url: string,
  id: number,
  longId: number,
  searchQuery: string | null,
  situation: string,
  creationYear: number,
  situationDate: string | null,
  lastUpdateDate: string | null,
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

  const statement = SQL`
  REPLACE INTO "group" (
  `

  const columns = Object.keys(group)
  columns.forEach((column, index) => {
    if (index < columns.length - 1) {
      statement.append(`"${column}", `)
      return
    }

    statement.append(`"${column}"`)
  })

  statement.append(SQL`)
  VALUES (
  `)

  const values = Object.values(group)
  values.forEach((value, index) => {
    if (index < values.length - 1) {
      statement.append(`'${value || null}', `)
      return
    }

    statement.append(`'${value || null}'`)
  })

  statement.append(SQL`)`)

  await db.run(statement)
}
