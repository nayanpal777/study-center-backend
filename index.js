var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');
const StudentController = require('./controllers/student');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', StudentController);

app.get('/', function (req, res) {
  res.send('Application running successfully');
});

app.listen(3000, function () {
  console.log('Server is running on port 3000');
});
