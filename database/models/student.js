//init code
const mongoose = require('mongoose');

//creating Schema
const StudentModel = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  usertype: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  fathername: {
    type: String,
    require: true
  },
  class: {
    type: String,
    require: true
  },
  board: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  }
});

//creating Models
mongoose.model('Student', StudentModel);
//exports model
module.exports = mongoose.model('Student');
