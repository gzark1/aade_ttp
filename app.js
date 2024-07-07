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
      res.render('data-retrieved', { service, data: result, csrfToken: req.csrfToken(), uuid });
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

  const parsedSelectedPropertyRecords = selectedPropertyRecords ? JSON.parse(selectedPropertyRecords) : [];
  const parsedSelectedLandLotRecords = selectedLandLotRecords ? JSON.parse(selectedLandLotRecords) : [];
  const parsedObligorData = obligorData ? JSON.parse(obligorData) : {};

  res.render('review-selected-data', {
    csrfToken: req.csrfToken(),
    selectedPropertyRecords: parsedSelectedPropertyRecords,
    selectedLandLotRecords: parsedSelectedLandLotRecords,
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
