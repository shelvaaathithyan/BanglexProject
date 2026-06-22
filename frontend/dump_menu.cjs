const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.mobile-only-menu-wrapper');
  const html = await page.evaluate(() => {
    const el = document.querySelector('.mobile-only-menu-wrapper');
    return el ? el.outerHTML : 'NOT FOUND';
  });
  console.log(html);
  await browser.close();
})();
