const router = require('express').Router();
const bodyparser = require('body-parser');
const student = require('../database/models/student');
const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  return res.send('Student Module Working fine....');
})

router.get('/students', function (req, res) {
  student.find({}, (err, result)=>{
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

router.post('/createStudent', [
  check('name').not().isEmpty().trim().escape(),
  check('phone').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
  check('board').not().isEmpty().trim().escape(),
  check('address').not().isEmpty().trim().escape(),
], (req, res) => {
  data = { name: req.body.name, phone: req.body.phone, class: req.body.class, board: req.body.board, address: req.body.address }
  console.log(data);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      msg: 'Invalid Input or any field is empty',
      err: error.array()
    });
  }
  student.create(data, (err, result) => {
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
      msg: 'Data saved successfully.',
      res: result
    })
  });
});

//exports module
module.exports = router;
