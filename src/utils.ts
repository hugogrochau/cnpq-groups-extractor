import { Page } from 'puppeteer'

export const getText = async (page: Page, selector: string, regex?: RegExp) => {
  const result = await page.$eval(selector, el => el.textContent)

  if (!result) {
    return ''
  }

  if (!regex) {
    return result.trim()
  }

  const matchResults = result.match(regex)
  if (!matchResults) {
    throw new Error(`Couldn't find any matches for selector ${selector} and regex ${regex}`)
  }

  return matchResults[1].trim()
}