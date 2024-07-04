const puppeteer = require('puppeteer');
const InvalidCredentialsError = require('../errors/InvalidCredentialsError');

const delay = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const getObligorData = async (page) => {
  const obligorData = {
    "TIN": await page.$eval('tr.xql#pt1\\:plam2 td.xso.xqs', el => el.innerText),
    "Lastname": await page.$eval('tr.xql#pt1\\:plam3 td.xso.xqs', el => el.innerText),
    "Firstname": await page.$eval('tr.xql#pt1\\:plam1 td.xso.xqs', el => el.innerText),
    "Patronymic": await page.$eval('tr.xql#pt1\\:plam4 td.xso.xqs', el => el.innerText)
  };
  return obligorData;
};

const fillSchema = (schema, values) => {
  let index = 0;

  const fill = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        fill(obj[key]);
      } else {
        obj[key] = values[index] ? values[index].trim() : null;
        index++;
      }
    }
  };

  fill(schema);
  return schema;
};

const getPropertyData = async (page) => {
  const propertyData = [];
  const propertySchema = {
    "Α.Τ.ΑΚ.": null,
    "Κ.Α.Ε.Κ.": null,
    "Διεύθυνση Ακινήτου": {
      "Νομός": null,
      "Δήμος ή Κοινότητα": null,
      "Δημοτικό ή Κοινοτικό Διαμέρισμα": null,
      "Οδός - Αριθμός": null,
      "Τ.Κ.": null,
      "Π.": null
    },
    "Υπόλοιποι Δρόμοι Οικοδομικού Τετραγώνου - Προσόψεις": {
      "Οδός1": null,
      "Π.1": null,
      "Οδός2": null,
      "Π.2": null,
      "Οδός3": null,
      "Π.3": null
    },
    "Πλήθος προσόψεων": null,
    "Ο.Τ.": null,
    "Κατηγορία": null,
    "Ειδικών Συνθηκών": null,
    "Όροφος": null,
    "Κτίσμα": {
      "Επιφάνεια": {
        "Κύριοι Χώροι": null,
        "Βοηθητικοί Χώροι": null
      },
      "Μήκος πρόσοψης": null,
      "Έτος Κατασκ.": null,
      "Είδος Εμπρ. Δικ.": null,
      "Ποσοστό Συνιδ. %": null,
      "Έτος Γέν. Επικ.": null,
      "ΑΦΜ Επικ.": null
    },
    "Οικόπεδο": {
      "Επιφάνεια": null,
      "Μήκος πρόσοψης": null,
      "Είδος Εμπρ. Δικ.": null,
      "Ποσοστό Συνιδ. %": null,
      "Έτος Γέν. Επικ.": null,
      "ΑΦΜ Επικ.": null
    },
    "Συν. Επιφάνεια Κτισμάτων": null,
    "Ηλεκτρο- δοτούμενο": null,
    "Αρ. παροχής ηλεκτρικού/ εργοταξιακού ρεύματος": null,
    "Ειδική κατηγορία": null,
    "Χρήση Κτίσματος/ Οικοπέδου": null
  };
    
  try {
    const tbodySelector = 'div#pt1\\:r1\\:1\\:t2\\:\\:db table.x11e.x123 tbody';
    await page.locator(tbodySelector).setTimeout(2000).click();
    console.log('Property has data');
    const rows = await page.$$(tbodySelector + ' tr'); // Get all table rows within the tbody
    for (const row of rows) {
      const rowData = await page.evaluate(el => el.innerText, row);
      const cells = rowData.split('\t').map(cell => cell.trim() || ''); // Split cells and handle empty cells
      const filledSchema = fillSchema(propertySchema, cells);
      propertyData.push(filledSchema);
    }

    console.log('Property data collected.');
    console.log(JSON.stringify(propertyData, null, 2));
    return propertyData

  } catch (error) {
    return 'none';
  }
};

const getLandLotData = async (page) => {
  const landLotData = [];
  const landLotSchema = {
    "Α.Τ.ΑΚ.": null,
    "Κ.Α.Ε.Κ.": null,
    "Διεύθυνση Ακινήτου": {
      "Νομός": null,
      "Δήμος ή Κοινότητα": null,
      "Δημοτικό ή Κοινοτικό Διαμέρισμα": null,
      "Οδός - Αριθμός ή Θέση": null,
      "Τ.Κ.": null,
      "Πρόσοψη σε Οδό": null
    },
    "Απόσταση από Θάλασσα (μέχρι 800μ.)": null,
    "Απαλλοτριωτέα": null,
    "Αρδευόμενη": null,
    "Επιφάνεια Σε Τετραγωνικά Μέτρα": {
      "Μονοετής Καλλιέργεια": null,
      "Πολυετής Καλλιέργεια": {
        "Ελιές": null,
        "Λοιπές Δενδροκαλλιέργιες": null
      },
      "Βοσκότοπος/χέρσες μη καλλιεργήσιμες εκτάσεις": null,
      "Δασική Έκταση": null,
      "Μεταλλευτική ή Λατομική": null,
      "Υπαίθρια Έκθεση ή Χώρος Στάθμευσης": null
    },
    "Επιφάνεια κτισμάτων που βρίσκονται στο γήπεδο": {
      "Κατοικίες": null,
      "Αποθήκες - Γεωρ. Κτίσματα": null,
      "Επαγγελματικά ή Ειδικά κτίρια": null
    },
    "Συν. Επιφάνεια Κτισμάτων": null,
    "Ειδικές χρήσεις γης": null,
    "Είδος Εμπρ. Δικ.": null,
    "Ποσοστό Συνιδ. %": null,
    "Έτος Γέν. Επικ.": null,
    "ΑΦΜ Επικ.": null,
    "Ηλεκτρο- δοτούμενο": null,
    "Αρ. παροχής ηλεκτρικού/ εργοταξιακού ρεύματος": null,
    "Ειδική κατηγορία": null,
    "Χρήση γηπέδου": null
  };

  try {
    const tbodySelector = 'div#pt1\\:r1\\:1\\:t3\\:\\:db table.x11e.x123 tbody';
    await page.locator(tbodySelector).setTimeout(2000).click();
    console.log('Land lot has data');
    const rows = await page.$$(tbodySelector + ' tr'); // Get all table rows within the tbody
    for (const row of rows) {
      const rowData = await page.evaluate(el => el.innerText, row);
      const cells = rowData.split('\t').map(cell => cell.trim() || ''); // Split cells and handle empty cells
      const filledSchema = fillSchema(landLotSchema, cells);
      landLotData.push(filledSchema);
    }

    console.log('Land lot data collected.');
    console.log(JSON.stringify(landLotData, null, 2));
    return landLotData;

  } catch (error) {
    return 'none';
  }
};

const hasPropertyStatus = async (page) => {
  try { 
    //the row in the 1st table with the user's data. It exists only if there is a Property Status
    await page.locator('div#pt1\\:r1\\:1\\:t1\\:\\:db').setTimeout(2000).click();
    console.log('found the selector using LOCATOR');
    return true;
  } catch (error) {
    console.log(error.message)
    return false;
  }
};

const performE9Task = async (username, password) => {
  const browser = await puppeteer.launch({ headless: false }); // Set headless to false if you want to see the browser actions
  const page = await browser.newPage();
  
  try {
    // Navigate to the initial page
    await page.goto('https://www.aade.gr/dilosi-e9-enfia');
    console.log('Navigated to the initial page.');
    
    // Use locator for the cookie button
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

    // Check if the URL contains error parameters
    const currentUrl = newPage.url();
    if (currentUrl.includes('p_error_code=OAM-2')) {
      console.log('Login failed due to incorrect credentials.');
      throw new InvalidCredentialsError('Incorrect username or password');
    }
    
    // Click the 'Enter' (Είσοδος) button in the instructions page using locator
    await newPage.locator('#pt1\\:cbEnter').click();
    console.log('Clicked the "Enter" (Είσοδος) button in the instructions page');

    // Wait for navigation to finish after clicking the button
    await newPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
    console.log('Navigated to the next page after clicking the button.');

    // Click the 'Estates and lands' (Περιουσιακή Κατάσταση) <a> tag using locator
    await newPage.locator('#pt1\\:estatesAndLandsTab\\:\\:disAcr').click();
    console.log('Clicked the Estates and lands <a> tag');


    // Check if the person has an Property Status
    const hasStatus = await hasPropertyStatus(newPage);
    let propertyData, landLotData;

    if (!hasStatus) {
      propertyData = "No e9 statement";
      landLotData = "No e9 statement";
    } else {
      // Scrape data
      propertyData = await getPropertyData(newPage);
      landLotData = await getLandLotData(newPage);
    }

    const obligorData = await getObligorData(newPage);

    const data = {
      "obligor's data": obligorData,
      "property data": propertyData,
      "land lot data": landLotData
    };

    console.log(data);

    await delay(9999999)
  } catch (error) {
    await browser.close();
    throw error;
  }
};

module.exports = { performE9Task };
