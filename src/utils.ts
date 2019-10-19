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

export const timeout = <T>(ms: number, op: Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), ms)

    op.then(result => {
      clearTimeout(timeoutId)
      resolve(result)
    }).catch(err => {
      clearTimeout(timeoutId)
      reject(err)
    })
  })
}
