//init code
const mongoose = require('mongoose');

//creating Schema
const DashboardModel = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  class: {
    type: String,
    require: true
  },
  permission: {
    type: Boolean,
    require: true
  }
});

//creating Models
mongoose.model('Dashboard', DashboardModel);
//exports model
module.exports = mongoose.model('Dashboard');
