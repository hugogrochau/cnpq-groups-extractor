import puppeteer from 'puppeteer'

export const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US'],
    headless: true,
    defaultViewport: {
      width: 1920 / 2,
      height: 1080
    }
  })
  const [page] = await browser.pages()

  return { browser, page }
}
