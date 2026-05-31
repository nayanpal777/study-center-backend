const router = require('express').Router();
const dashboardModel = require('../database/models/dashboard');
const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  return res.send('Dashboard Module Working fine....');
})

// GET all dashboard records
router.get('/Data', async (req, res) => {
  try {
    const result = await dashboardModel.getAllDashboard();
    return res.json({
      status: true,
      msg: 'Student Data',
      res: result
    })
  } catch (err) {
    return res.json({
      status: false,
      msg: 'Having error while fetching data',
      err: err.message
    })
  }
});

// POST create dashboard record
router.post('/createDashboard', [
  check('name').not().isEmpty().trim().escape(),
  check('email').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      msg: 'Invalid Input or any field is empty',
      err: error.array()
    });
  }

  try {
    // Check if email already exists
    const existingRecord = await dashboardModel.getDashboardByEmail(req.body.email);
    if (existingRecord) {
      return res.json({
        status: false,
        msg: 'Already you have provide the access.'
      });
    }

    // Create dashboard record
    const data = { 
      name: req.body.name,
      email: req.body.email,
      class: req.body.class, 
      permission: false 
    }

    const result = await dashboardModel.createDashboardRecord(data);
    return res.json({
      status: true,
      msg: 'Request sent Successfully',
    })
  } catch (err) {
    return res.json({
      status: false,
      msg: 'Having error while saving your data',
      err: err.message
    })
  }
});

module.exports = router;