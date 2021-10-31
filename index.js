const puppeteer = require("puppeteer");

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      "--incognito",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ]
  });
  const tab = await browser.newPage();
  const text = await (await tab.goto("http://example.com/")).text();
  console.log(text);
  console.log("done");
  browser.close();
}

main();
