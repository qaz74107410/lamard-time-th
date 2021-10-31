const scraper = require('./scraper')
const moment = require('moment')

const testOrSkip = (condition) => condition ? test : test.skip;

describe('scaper work correctly', () => {

  test('should lamard url serialize correctly', () => {
    const url = scraper.getSerializeLamardUrl(moment("2021 11 24", "YYYY MM DD"))
    expect(url).toEqual('https://prayertime.muslimthaipost.com/index.php?Htm&today=24&dfMonth=11&dfYear=2021&province_no=24&GP=1&amphor_no=354&latitude_form=&longitude_form=&sun=1&method=PS&aitsubh=19&aitisha=18&midsea=0&ct=2&mp=0&ju=1&jState=none&dtime')
  })

  test('should get timetable element', async () => {
    let browser = await scraper.getDefaultBrowser()
    expect(browser).not.toBeNull()
    try {      
      const table = await scraper.getTimeTableElement(browser, "https://prayertime.muslimthaipost.com/index.php?Htm&today=24&dfMonth=11&dfYear=2021&province_no=24&GP=1&amphor_no=354&latitude_form=&longitude_form=&sun=1&method=PS&aitsubh=19&aitisha=18&midsea=0&ct=2&mp=0&ju=1&jState=none&dtime")
      expect(table).not.toBeNull()

    } finally {
      browser.close()
    } 
  })
})