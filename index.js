const scraper = require('./scraper')
const logger = require('pino')({
  pretty: true,
});
const moment = require('moment')
const FormData = require('form-data');
const { default: axios } = require('axios');

require('moment/locale/th.js');
require('dotenv').config()

if (process.env.NODE_ENV === 'development') {
  logger.level = 'trace';
}

async function main() {
  logger.debug("main start")
  const browser = await scraper.getDefaultBrowser()
  try {
    const now = moment().local('th')
    const url = scraper.getSerializeLamardUrl(now)
    const filename = "time-table.png"
    
    logger.info(`date ${now.format('YYYY-MM-DD')}, scraping ${url}`)
    const table = await scraper.getTimeTableElement(browser, url)
    if (table) {
      await table.screenshot({path: filename});
      console.info(`scraping done "${filename}"`);
    } else {
      console.warn(`scraping failed`)
    }

    const formData = scraper.generateFormData(now, filename)
    sendNotify(formData).then(res => {
      console.log(res);
      logger.child().info(`send notify with status ${res.status}`)
    }, err => {
      logger.error(`send notify with errror ${err}`)
    })

  } catch (error) {
    logger.error(error)
  } finally {
    browser.close();
  }
  // const tab = await browser.newPage();
  // const text = await (await tab.goto("http://example.com/")).text();
  // console.log(text);
  // console.log("done");
  // browser.close();
  logger.debug("main done")
}

/**
 * @param  {FormData} formData
 */
function sendNotify(formData) {
  return axios.post("https://notify-api.line.me/api/notify", formData, {
    headers: { 
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.LINE_TOKEN}`
    },
  })
}

main()