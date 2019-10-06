import puppeteer from 'puppeteer'

export const launchBrowser = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US'], headless: false })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  return { browser, page }
}
