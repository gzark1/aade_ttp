const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get('/', (req, res) => {
  res.render('company');
});

// Endpoint to accept JSON data
app.post('/receive-data', (req, res) => {
  const { uuid, selectedPropertyRecords, selectedLandLotRecords, obligorData } = req.body;
  console.log('Received Data:', {
    uuid,
    selectedPropertyRecords,
    selectedLandLotRecords,
    obligorData
  });

  res.json({
    status: 'success',
    uuid,
    selectedPropertyRecords,
    selectedLandLotRecords,
    obligorData
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Company website server is running on port ${PORT}`);
});
