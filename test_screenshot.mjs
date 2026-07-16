import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log("Setting localStorage and going to /employees...");
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({ role: 'manager', employeeId: 'EMP1001', name: 'Rajesh Kumar' }));
  });
  
  await page.goto('http://localhost:5173/employees');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'artifacts/employees_screenshot.jpg' });

  await browser.close();
  console.log("Done.");
})();
