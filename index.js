var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');
const StudentController = require('./controllers/student');
const DashboardController = require('./controllers/dashboard');
var app = express();

const DB_DOWNLOAD_TOKEN = process.env.DB_DOWNLOAD_TOKEN || '';
const DB_FILE_PATH = path.join(__dirname, 'database', 'study_center.db');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', StudentController);
app.use('/Dashboard', DashboardController);

app.get('/', function (req, res) {
  res.send('Application running successfully');
});

app.get('/download-db', function (req, res) {
  const token = req.query.token || req.headers['x-download-token'];

  if (!DB_DOWNLOAD_TOKEN) {
    return res.status(500).json({
      status: false,
      msg: 'DB download token not configured on server.'
    });
  }

  if (!token || token !== DB_DOWNLOAD_TOKEN) {
    return res.status(401).json({
      status: false,
      msg: 'Unauthorized. Invalid or missing download token.'
    });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    return res.status(404).json({
      status: false,
      msg: 'Database file not found.'
    });
  }

  res.download(DB_FILE_PATH, 'study_center.db', (err) => {
    if (err) {
      console.error('Error sending database file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          status: false,
          msg: 'Failed to download database file.'
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log('Server is running on port 3000');
});
