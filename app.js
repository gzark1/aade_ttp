require('dotenv').config();
const express = require('express');

const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');
const e9Service = require('./puppeteer/e9');
const otherService = require('./puppeteer/other-service');
const errorHandler = require('./middleware/errorHandler');
const InvalidCredentialsError = require('./errors/InvalidCredentialsError');

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
app.get('/login', csrfProtection, (req, res) => {
  const service = req.query.service || 'default service'; //we want it to also get the UUID
  const error = req.query.error;
  res.render('login', { csrfToken: req.csrfToken(), service, error });
});

app.post('/login', csrfProtection, async (req, res, next) => {
  const { username, password, service } = req.body;
  try {
    if (services[service]) {    //check if this service exists. 
      const result = await services[service](username, password);
      res.send({ service, result });
    } else {
      res.status(400).send('This service does not exist in AADE');
    }
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

