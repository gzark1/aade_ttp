const puppeteer = require('puppeteer');
const fs = require('fs');

const delay = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const performE9Task = async (username, password) => {
  const browser = await puppeteer.launch({ headless: false }); // Set headless to false if you want to see the browser actions
  const page = await browser.newPage();
  
  try {
    // Navigate to the initial page
    await page.goto('https://www.aade.gr/dilosi-e9-enfia');
    console.log('Navigated to the initial page.');

    // Wait for the cookie popup and click the accept button
    await page.waitForSelector('.agree-button.eu-cookie-compliance-default-button', { visible: true });
    await page.click('.agree-button.eu-cookie-compliance-default-button');
    console.log('Clicked the cookie accept button.');

    // Wait for 2 seconds
    await delay(2000);

    // Set up a listener for the new target (new tab)
    const [newPagePromise] = await Promise.all([
      new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
      // Click the specific div containing the login button
      page.click('div.field--name-field-koympi.field--type-link.field--label-hidden.field__item a')
    ]);
    const newPage = await newPagePromise;
    console.log('Clicked the button to navigate to the login page.');

    // Wait for 2 seconds
    await delay(2000);

    // Check if we are already on the login page by checking the URL
    if (!newPage.url().includes('login')) {
      // Wait for navigation to the login page in the new tab
      await newPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      console.log('Navigated to the login page.');
    } else {
      console.log('Already navigated to the login page.');
    }

    // Take a screenshot after navigation to debug
    await newPage.screenshot({ path: 'after-navigation.png' });

    // Wait for the login form to be available, increase timeout to 60 seconds
    await newPage.waitForSelector('input[name="username"]', { visible: true, timeout: 60000 });
    await newPage.waitForSelector('input[name="password"]', { visible: true, timeout: 60000 });
    console.log('Login form is visible.');

    // Enter username and password
    await newPage.type('input[name="username"]', username);
    await newPage.type('input[name="password"]', password);
    console.log('Entered username and password.');

    // Wait for 2 seconds
    await delay(2000);

    // Click the login button
    await newPage.waitForSelector('button[name="btn_login"]', { visible: true });
    await newPage.click('button[name="btn_login"]');
    console.log('Clicked the login button.');

    // Wait for 2 seconds
    await delay(2000);

    // Wait for navigation to finish with no timeout

    // Click the button with id="pt1:cbEnter"
    await newPage.waitForSelector('#pt1\\:cbEnter', { visible: true });
    await newPage.click('#pt1\\:cbEnter');
    console.log('Clicked the button with id="pt1:cbEnter".');

    // Wait for navigation to finish after clicking the button
    await newPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
    console.log('Navigated to the next page after clicking the button.');

    // Get the HTML content of the page you are redirected to
    const data = await newPage.content();

    // Process the data (this is just an example, you'll need to parse the content as needed)
    console.log(data);

    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

module.exports = { performE9Task };
