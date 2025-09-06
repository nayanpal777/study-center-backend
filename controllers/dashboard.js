const router = require('express').Router();
const dashboard = require('../database/models/dashboard');
const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  return res.send('Dashboard Module Working fine....');
})

router.get('/Data', function (req, res) {
  dashboard.find({}, (err, result)=>{
    if (err) {
      return res.json({
        status: false,
        msg: 'Having error while saving your data',
        err: err
      })
    }
    //if ok
    return res.json({
      status: true,
      msg: 'Student Data',
      res: result
    })
  });
});

router.post('/createDashboard', [
  check('name').not().isEmpty().trim().escape(),
  check('email').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
], (req, res) => {
  
  data = { name: req.body.name,
           email: req.body.email,
           class: req.body.class, 
           permission: false }
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      msg: 'Invalid Input or any field is empty',
      err: error.array()
    });
  }
  dashboard.findOne({ 'email': req.body.email }, (err, data) => {
    if (data) {
      return res.json({
          status: false,
          msg: 'Already you have provide the access.'
      });
    } else {
      dashboard.create(data, (err, result) => {
        if (err) {
          return res.json({
            status: false,
            msg: 'Having error while saving your data',
            err: err
          })
        }
        //if ok
        return res.json({
          status: true,
          msg: 'Request sent Successfully',
        })
      });
    }
  });
});

module.exports = router;