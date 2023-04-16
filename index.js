var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./database/db');
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Application running successfully');
});

app.get('/students', function (req, res) {
  db.serialize(() => {
    db.all('SELECT * FROM student', function (err, result) {
      if (err) {
        res.json({
          status: false,
          result: err.message 
        });  
      }
      res.json({
        status: true,
        result: result
      });
    });
  });
});

app.post('/createStudent', function (req, res) {
  if (req.body.name == '' || req.body.phone == '' || req.body.class == '' || req.body.address == '') {
    res.send("Field cann't be empty");
  } else {
    db.serialize(() => {
      db.run('INSERT INTO student(name, phone, class, address) VALUES(?,?,?,?)', [req.body.name, req.body.phone, req.body.class, req.body.address], function (err) {
        if (err) {
          res.json({
            status: false,
            err: err.message
          });
        }
        res.json({
          status: true,
          result: 'Data saved.'
        });
      });
    });
  }
});

app.listen(3000, function () {
  console.log('Server is running on port 3000');
});