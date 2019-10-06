import fetch from 'node-fetch'
import { logger } from './logger'
import { JSDOM } from 'jsdom'

export const fetchPage = async (url: string): Promise<JSDOM> => {
  logger.debug(`Fetching page ${url}`)
  const response = await fetch(url, {
    method: 'GET'
  })

  const responseText = await response.text()

  logger.debug(`Response text for url ${url}:\n${responseText}`)

  return new JSDOM(responseText)
}
