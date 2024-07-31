const express = require('express');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');
const e9Service = require('./puppeteer/e9');
const otherService = require('./puppeteer/other-service');
const errorHandler = require('./middleware/errorHandler');
const InvalidServiceError = require('./errors/InvalidServiceError');
const axios = require('axios'); // Add axios for HTTP requests
const { v4: uuidv4 } = require('uuid'); // Add UUID module
const { log } = require('console');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const csrfProtection = csrf({ cookie: true });

// Configuration object for services
const services = {
  'e9': e9Service.performE9Task,
  'other-service': otherService.performOtherTask
};

const propertyHeaders = [
  "Α.Τ.ΑΚ.",
  "Κ.Α.Ε.Κ.",
  "Νομός",
  "Δήμος ή Κοινότητα",
  "Δημοτικό ή Κοινοτικό Διαμέρισμα",
  "Οδός - Αριθμός",
  "Τ.Κ.",
  "Π.",
  "Οδός1",
  "Π.1",
  "Οδός2",
  "Π.2",
  "Οδός3",
  "Π.3",
  "Πλήθος προσόψεων",
  "Ο.Τ.",
  "Κατηγορία",
  "Ειδικών Συνθηκών",
  "Όροφος",
  "Κύριοι Χώροι",
  "Βοηθητικοί Χώροι",
  "Μήκος πρόσοψης",
  "Έτος Κατασκ.",
  "Είδος Εμπρ. Δικ.",
  "Ποσοστό Συνιδ. %",
  "Έτος Γέν. Επικ.",
  "ΑΦΜ Επικ.",
  "Συν. Επιφάνεια Κτισμάτων",
  "Ηλεκτρο- δοτούμενο",
  "Αρ. παροχής ηλεκτρικού/ εργοταξιακού ρεύματος",
  "Ειδική κατηγορία",
  "Χρήση Κτίσματος/ Οικοπέδου"
];

const landLotHeaders = [
  "Α.Τ.ΑΚ.",
  "Κ.Α.Ε.Κ.",
  "Νομός",
  "Δήμος ή Κοινότητα",
  "Δημοτικό ή Κοινοτικό Διαμέρισμα",
  "Οδός - Αριθμός ή Θέση",
  "Τ.Κ.",
  "Πρόσοψη σε Οδό",
  "Απόσταση από Θάλασσα (μέχρι 800μ.)",
  "Απαλλοτριωτέα",
  "Αρδευόμενη",
  "Μονοετής Καλλιέργεια",
  "Ελιές",
  "Λοιπές Δενδροκαλλιέργιες",
  "Βοσκότοπος/χέρσες μη καλλιεργήσιμες εκτάσεις",
  "Δασική Έκταση",
  "Μεταλλευτική ή Λατομική",
  "Υπαίθρια Έκθεση ή Χώρος Στάθμευσης",
  "Κατοικίες",
  "Αποθήκες - Γεωρ. Κτίσματα",
  "Επαγγελματικά ή Ειδικά κτίρια",
  "Συν. Επιφάνεια Κτισμάτων",
  "Ειδικές χρήσεις γης",
  "Είδος Εμπρ. Δικ.",
  "Ποσοστό Συνιδ. %",
  "Έτος Γέν. Επικ.",
  "ΑΦΜ Επικ.",
  "Ηλεκτρο- δοτούμενο",
  "Αρ. παροχής ηλεκτρικού/ εργοταξιακού ρεύματος",
  "Ειδική κατηγορία",
  "Χρήση γηπέδου"
];

function transformData(data, headers) {
  return data.map(item => {
    const transformed = {};
    headers.forEach(header => {
      // Traverse the nested structure based on specific header mapping
      switch (header) {
        case "Νομός":
        case "Δήμος ή Κοινότητα":
        case "Δημοτικό ή Κοινοτικό Διαμέρισμα":
        case "Οδός - Αριθμός":
        case "Τ.Κ.":
        case "Π.":
        case "Οδός - Αριθμός ή Θέση":
        case "Πρόσοψη σε Οδό":
          transformed[header] = item["Διεύθυνση Ακινήτου"] ? item["Διεύθυνση Ακινήτου"][header] : null;
          break;
        case "Οδός1":
        case "Π.1":
        case "Οδός2":
        case "Π.2":
        case "Οδός3":
        case "Π.3":
          const suffix = header.slice(-1);
          transformed[header] = item["Υπόλοιποι Δρόμοι Οικοδομικού Τετραγώνου - Προσόψεις"] ? item["Υπόλοιποι Δρόμοι Οικοδομικού Τετραγώνου - Προσόψεις"][header.slice(0, -2) + suffix] : null;
          break;
        case "Κύριοι Χώροι":
        case "Βοηθητικοί Χώροι":
        case "Μονοετής Καλλιέργεια":
        case "Ελιές":
        case "Λοιπές Δενδροκαλλιέργιες":
        case "Βοσκότοπος/χέρσες μη καλλιεργήσιμες εκτάσεις":
        case "Δασική Έκταση":
        case "Μεταλλευτική ή Λατομική":
        case "Υπαίθρια Έκθεση ή Χώρος Στάθμευσης":
        case "Κατοικίες":
        case "Αποθήκες - Γεωρ. Κτίσματα":
        case "Επαγγελματικά ή Ειδικά κτίρια":
          transformed[header] = item["Επιφάνεια Σε Τετραγωνικά Μέτρα"] && item["Επιφάνεια Σε Τετραγωνικά Μέτρα"][header] ? item["Επιφάνεια Σε Τετραγωνικά Μέτρα"][header] : null;
          break;
        default:
          transformed[header] = item[header] || (item["Κτίσμα"] ? item["Κτίσμα"][header] : null) || (item["Οικόπεδο"] ? item["Οικόπεδο"][header] : null);
      }
    });
    return transformed;
  });
}

function manipulateResult(result) {
  // Copying obligor's data without changes
  const manipulatedResult = {
    "obligor's data": result["obligor's data"]
  };

  // Transforming property data
  if (Array.isArray(result["property data"])) {
    manipulatedResult["property data"] = transformData(result["property data"], propertyHeaders);
  }

  // Transforming land lot data
  if (Array.isArray(result["land lot data"])) {
    manipulatedResult["land lot data"] = transformData(result["land lot data"], landLotHeaders);
  }

  return manipulatedResult;
}

// Routes
app.get('/login', csrfProtection, (req, res, next) => {
  const service = req.query.service || 'default service';
  const error = req.query.error;
  const uuid = req.query.uuid || uuidv4(); // Generate a UUID if not provided

  if (!services[service]) {
    return next(new InvalidServiceError());
  }
  
  res.render('login', { csrfToken: req.csrfToken(), service, error, uuid });
});

app.post('/login', csrfProtection, async (req, res, next) => {
  const { username, password, service, uuid } = req.body;
  try {
    if (services[service]) {
      const result = await services[service](username, password);
      const result_manipulated = manipulateResult(result);
      console.log('\n\n---------RESULT VARIABLE-------\n\n');
      console.log(JSON.stringify(result, null, 2));
      console.log('---------RESULT MANIPULATED VARIABLE-------');
      console.log(JSON.stringify(result_manipulated, null, 2));
      res.render('data-retrieved', { service, data: result_manipulated, csrfToken: req.csrfToken(), uuid});
    } else {
      return next(new InvalidServiceError());
    }
  } catch (error) {
    next(error);
  }
});

// Route to handle the submission of selected records
app.post('/submit-selected-data', csrfProtection, (req, res) => {
  const { service, selectedPropertyRecords, selectedLandLotRecords, obligorData, uuid } = req.body;
  function ensureListFormat(data) {
    // Check if the data is a string or an array of strings
    if (typeof data === 'string') {
      // If it's a single JSON string, parse it and return as an array
      try {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          // If parsed data is already an array, return it
          return parsedData.map(item => JSON.parse(item));
        } else {
          // Otherwise, wrap it in an array
          return [parsedData];
        }
      } catch (e) {
        console.error("Error parsing data:", e);
        return [];
      }
    } else if (Array.isArray(data)) {
      // If it's an array of strings, parse each item
      return data.map(item => JSON.parse(item));
    }
    return [];
  }
  const parsedObligorData = JSON.parse(obligorData);

  // Convert strings back to objects and ensure list format
  const parsedPropertyRecords = ensureListFormat(selectedPropertyRecords);
  const parsedLandLotRecords = ensureListFormat(selectedLandLotRecords);
  console.log('------------ Parsed property data ------');
  console.log(parsedPropertyRecords);
  console.log('-------Parsed LandLot Records -----')
  console.log(parsedLandLotRecords);


  res.render('review-selected-data', {
    csrfToken: req.csrfToken(),
    selectedPropertyRecords: parsedPropertyRecords,
    selectedLandLotRecords: parsedLandLotRecords,
    obligorData: parsedObligorData,
    service,
    uuid
  });
});

// Route to confirm submission and send data to the company
app.post('/confirm-submission', csrfProtection, async (req, res) => {
  const { selectedPropertyRecords, selectedLandLotRecords, obligorData, uuid } = req.body;

  try {
    const response = await axios.post(`http://localhost:4000/receive-data`, {
      uuid: uuid,
      selectedPropertyRecords: JSON.parse(selectedPropertyRecords),
      selectedLandLotRecords: JSON.parse(selectedLandLotRecords),
      obligorData: JSON.parse(obligorData)
    });

    res.redirect(`http://localhost:4000/receive-data?uuid=${uuid}`);
  } catch (error) {
    res.status(500).send('Error submitting data');
  }
});

app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Our app server is running on port ${PORT}`);
});
