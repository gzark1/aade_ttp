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
    
    // Use locator for the cookie button  -- TODO Test
    const cookieButton = page.locator('.agree-button.eu-cookie-compliance-default-button').setTimeout(2000);
    await cookieButton.click().catch(() => console.log('Cookie button not found or not clickable.'));
    console.log('Clicked the cookie accept button.');

    // Wait for 2 seconds
    await delay(1000);

    // Set up a listener for the new target (new tab)
    const [newPagePromise] = await Promise.all([
      new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
      // Click the specific div containing the login button using locator
      page.locator('div.field--name-field-koympi.field--type-link.field--label-hidden.field__item a').click()
    ]);
    const newPage = await newPagePromise;
    console.log('Clicked the button to navigate to the login page.');

    // Wait for 2 seconds
    await delay(1000);

    // Check if we are already on the login page by checking the URL
    if (!newPage.url().includes('login')) {
      // Wait for navigation to the login page in the new tab
      await newPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      console.log('Navigated to the login page.');
    } else {
      console.log('Already navigated to the login page.');
    }

    // Enter username and password
    await newPage.locator('input[name="username"]').fill(username);
    await newPage.locator('input[name="password"]').fill(password);
    console.log('Entered username and password.');

    // Wait for 2 seconds
    await delay(1000);

    // Click the login button using locator
    await newPage.locator('button[name="btn_login"]').click();
    console.log('Clicked the login button.');

    // Wait for 2 seconds
    await delay(2000);

    // Click the 'Enter' (Είσοδος) button in the instructions page using locator
    await newPage.locator('#pt1\\:cbEnter').click();
    console.log('Clicked the "Enter" (Είσοδος) button in the instructions page');

    // Wait for navigation to finish after clicking the button
    await newPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
    console.log('Navigated to the next page after clicking the button.');

    // Click the 'Estates and lands' (Περιουσιακή Κατάσταση) <a> tag using locator
    await newPage.locator('#pt1\\:estatesAndLandsTab\\:\\:disAcr').click();
    console.log('Clicked the Estates and lands <a> tag');

    await delay(9999999)
  } catch (error) {
    await browser.close();
    throw error;
  }
};

module.exports = { performE9Task };
