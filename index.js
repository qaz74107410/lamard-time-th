const scraper = require('./scraper')
const logger = require('pino')({
  pretty: true,
});
const moment = require('moment')
const FormData = require('form-data');
const bearerToken = require('express-bearer-token');
const { default: axios } = require('axios');

require('moment/locale/th.js');
require('dotenv').config()

if (process.env.NODE_ENV === 'development') {
  logger.level = 'trace';
}

/**
 * @param  {moment.Moment} date
 * @param  {{notify=false}} options
 */
async function lamard(date, options = { notify: false }) {
  logger.debug("main start")
  const browser = await scraper.getDefaultBrowser()
  try {
    // const date = moment().local('th')
    const url = scraper.getSerializeLamardUrl(date)
    const filename = "time-table.png"
    
    logger.info(`date ${date.format('YYYY-MM-DD')}, scraping ${url}`)
    const table = await scraper.getTimeTableElement(browser, url)
    if (table) {
      await table.screenshot({path: filename});
      logger.info(`scraping done "${filename}"`);
      
      const formData = scraper.generateFormData(date, filename)

      if (options.notify) {
        sendNotify(formData).then(res => {
          logger.child({ data: res.data }).info(`send notify completed`)
        }, err => {
          logger.error(`send notify completed with errror ${err}`)
        })
      }

    } else {
      logger.warn(`scraping failed`)
    }


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

// create an express app
const express = require("express")
const app = express()

app.use(bearerToken());
app.use(express.json());

// define the first route
app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>")
})

app.get("/lamard-now", function(req, res) {

  logger.debug(`req.token: ${req.token}, process.env.SECRET: ${process.env.APP_SECRET}`)

  if (req.token !== (process.env.APP_SECRET || "")) { return res.sendStatus(403) }

  const { YYYYMMDD, notify } = req.body
  logger.debug(`req.body: ${req.body}`)
  let date
  if (YYYYMMDD) {
    date = moment(YYYYMMDD, "YYYYMMDD")
  } else {
    date = moment()
  }

  logger.debug(`date: ${date}`)

  lamard(date, { notify: notify || false });
  
  return res.sendStatus(200)
})

// start the server listening for requests
app.listen(process.env.PORT || 3000, function() { 
  logger.info(`server is running on ${this.address().port}`)
})