import * as R from 'ramda'
import { logger } from './logger'
import * as sqlite from 'sqlite'
import { SQL } from 'sql-template-strings'
import { escape } from 'sqlstring'

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

export interface FailedExtraction {
  searchQuery: string,
  title: string,
  errorMessage: string,
  pageSize: number,
  page: number,
  resultIndex: number
}

export const saveFailedExtraction = async (failedExtraction: FailedExtraction) => {
  logger.info(`Saving failed extraction ${failedExtraction.title} to database`)

  const statement = generateReplaceStatement(failedExtraction, 'failed_extraction')

  await db.run(statement)
}

export const saveGroup = async (group: Group) => {
  logger.info(`Saving group ${group.title} to database`)

  const statement = generateReplaceStatement(group, 'group')

  await db.run(statement)
}

const generateReplaceStatement = (object: {[key: string]: any}, table: string) => {
  const statement = SQL`
  REPLACE INTO `

  statement.append(`"${table}" (`)

  const columns = Object.keys(object)
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

  const values = Object.values(object)
  values.forEach((value, index) => {
    const escapedValue = escape(R.isNil(value) || value === '' ? null : value).replace(/\\'/g, '\'\'')

    if (index < values.length - 1) {
      statement.append(`${escapedValue}, `)
      return
    }

    statement.append(`${escapedValue}`)
  })

  statement.append(SQL`)`)

  return statement
}
