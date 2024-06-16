require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const csrfProtection = csrf({ cookie: true });

// Routes
app.get('/login', csrfProtection, (req, res) => {
  const service = req.query.service || 'default service';
  res.render('login', { csrfToken: req.csrfToken(), service });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

