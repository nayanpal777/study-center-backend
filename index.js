var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
// Importing db triggers Turso connection + schema initialization on startup
require('./database/db');
const StudentController = require('./controllers/student');
const DashboardController = require('./controllers/dashboard');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', StudentController);
app.use('/Dashboard', DashboardController);

app.get('/', function (req, res) {
  res.send('Application running successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
