import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`)
  );

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/');
  
  console.log('Waiting for network idle...');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});

  console.log('Logging in...');
  // Type username/password or mock localStorage
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({ role: 'manager', employeeId: 'EMP1001', name: 'Rajesh Kumar' }));
  });

  console.log('Reloading to apply login...');
  await page.goto('http://localhost:5173/manager-dashboard');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});

  console.log('Navigating to Employee Management...');
  await page.goto('http://localhost:5173/employees');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});

  console.log('Navigating to Leave...');
  await page.goto('http://localhost:5173/leave');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});
  
  console.log('Navigating to Profile...');
  await page.goto('http://localhost:5173/profile');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => {});

  await browser.close();
  console.log('Done.');
})();
