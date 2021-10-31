const puppeteer = require("puppeteer");
const moment = require('moment')
const FormData = require('form-data');
const fs = require('fs');

require('moment/locale/th.js');

const TIME_TABLE_SECTECTOR = "body > table > tbody > tr:nth-child(3) > td:nth-child(3) > table:nth-child(8)"

/**
 * get time table element from browser
 * 
 * @param  {puppeteer.Browser} browser
 * @param  {string} lamard_url
 */
async function getTimeTableElement(browser, lamard_url) {
  const page = await browser.newPage();
  let attempts = 0;
  while (attempts < 10) {
    try {
      await page.goto(lamard_url, { waitUntil: 'domcontentloaded' });
    
      // screen short only time-table element
      await page.waitForSelector(TIME_TABLE_SECTECTOR);
      const table = await page.$(TIME_TABLE_SECTECTOR);
      if (table) {
        await page.evaluate((selector) => {
          const elem = document.querySelector(selector)
          elem.style.fontFamily = "Tahoma, Lucida Grande, Loma, sans-serif"
        }, TIME_TABLE_SECTECTOR)
      }
      return table
    } catch (error) {
      console.log(error);
      attempts++; 
    }
  }
  return null;
}
/**
 * get ready date page with timetable
 * 
 * example url
 * https://prayertime.muslimthaipost.com/index.php?Htm&today=31&dfMonth=10&dfYear=2021&province_no=24&GP=1&amphor_no=354&latitude_form=&longitude_form=&sun=1&method=PS&aitsubh=19&aitisha=18&midsea=0&ct=2&mp=0&ju=1&jState=none&dtime
 * 
 * @param  {moment.Moment} date
 */
function getSerializeLamardUrl(date) {
  return `https://prayertime.muslimthaipost.com/index.php?Htm&today=${date.format("DD")}&dfMonth=${date.format("MM")}&dfYear=${date.format("YYYY")}&province_no=24&GP=1&amphor_no=354&latitude_form=&longitude_form=&sun=1&method=PS&aitsubh=19&aitisha=18&midsea=0&ct=2&mp=0&ju=1&jState=none&dtime`
}
/**
 * get default working browser
 * 
 * @returns {puppeteer.Browser}
 */
async function getDefaultBrowser() {
  return puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1024, height: 768 },
    args: [
      "--incognito",
      "--no-sandbox",
      "--single-process",
      // "--no-zygote"
    ]
  });
}

/**
 * @param {moment.Moment} date
 * @param  {string} imageFile
 * @returns {FormData}
 */
function generateFormData(date, imageFile) {
  const messagePrefix = "เวลาละหมาด อัพเดทล่าสุด: "

  const formData = new FormData();
  formData.append('message', `${messagePrefix}${moment(date).format('Do MMMM YYYY, h:mm:ss')}`);
  formData.append('imageFile', fs.createReadStream(imageFile));
  return formData
}

exports.getSerializeLamardUrl = getSerializeLamardUrl
exports.getDefaultBrowser = getDefaultBrowser
exports.getTimeTableElement = getTimeTableElement
exports.generateFormData = generateFormData