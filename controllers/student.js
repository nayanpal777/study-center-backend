const router = require('express').Router();
const bodyparser = require('body-parser');
const bcryptjs = require('bcryptjs');
const student = require('../database/models/student');
const { check, validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;

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
  check('usertype').not().isEmpty().trim().escape(),
  check('email').not().isEmpty().trim().escape(),
  check('fathername').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
  check('board').not().isEmpty().trim().escape(),
  check('address').not().isEmpty().trim().escape(),
  check('password').not().isEmpty().trim().escape(),
], (req, res) => {
  
  const hashpassword = bcryptjs.hashSync(req.body.password, 10);
  data = { name: req.body.name,
           phone: req.body.phone, 
           usertype: req.body.usertype,
           email: req.body.email,
           fathername: req.body.fathername,
           class: req.body.class, 
           board: req.body.board, 
           address: req.body.address, 
           password: hashpassword }
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      msg: 'Invalid Input or any field is empty',
      err: error.array()
    });
  }
    student.findOne({ 'phone': req.body.phone }, (err, present) => {
        if (err) {
            return res.json({
                status: false,
                msg: 'Server Problem Please try later...!',
                error: err
            })
        } else if (present) {
            return res.json({
                status: false,
                msg: "Your phone number is already register, Please use different phone number.",
            })
        } else {
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
        }
    })
});

/**---------------------------------------------------
    *Route for Student Login  
------------------------------------------------------*/
router.post('/StudentLogin',
    [
        check('email').isEmail().normalizeEmail(),
        check('password').not().isEmpty().trim().escape()
    ], (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        student.findOne({ 'email': req.body.email }, (err, student) => {
            if (!student) {
                return res.json({
                    status: false,
                    msg: 'Email Not Found please SignUp First...!'
                });
            } else {
                bcryptjs.compare(req.body.password, student.password, (err, isMatch) => {
                    //if error
                    if (err)
                        return res.send('error');

                    //check password valid or not
                    if (isMatch === false) {
                        return res.json({
                            status: false,
                            msg: 'Invalid Password'
                        });
                    } else {
                        return res.status(200).json({
                            status: true,
                            msg: 'Login Sucessfully....',
                            data: student
                        });
                    }
                });
            }
        });
    });

/**---------------------------------------------------
    * Forgot password API  
------------------------------------------------------*/
router.put('/forgotpassword',
    [
        check('email').isEmail().normalizeEmail(),
        check('password').not().isEmpty().trim().escape()
    ],
    (req, res) => {
        //check validation Errors
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }
        //password hashing
        const hashpassword = bcryptjs.hashSync(req.body.password, 10);
        student_model.findOneAndUpdate({ 'email': req.body.email }, { 'password': hashpassword }, (err, result) => {
            //if error
            if (err) {
                return res.json({
                    status: false,
                    msg: 'Server Error, please contact to Admin',
                    error: err
                });
            }
            //if result is null then email id not found
            if (result === null) {
                return res.json({
                    status: false,
                    msg: 'Email Not Found please SignUp First...!',
                });
            } else {
                return res.json({
                    status: true,
                    msg: 'password change successfully....!',
                });
            }

        });
    }
);

/**---------------------------------------------------
    * Update Profile Link API  
------------------------------------------------------*/
router.patch('/UpdateProfileLink',
    [
        check('phone').not().isEmpty().trim().escape()    
    ],
    (req, res) => {
        //check validation Errors
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        student.findOneAndUpdate({ 'phone': req.body.phone }, { 'profile_link': req.body.profile_link }, (err, result) => {
            //if error
            if (err) {
                return res.json({
                    status: false,
                    msg: 'Server Error, please contact to Admin',
                    error: err
                });
            }
            //if result is null then email id not found
            if (result === null) {
                return res.json({
                    status: false,
                    msg: 'Record Not Found In DB, Contact Admin...!',
                });
            } else {
                return res.json({
                    status: true,
                    msg: 'Profile Link Updated, It will be shown to student..!',
                });
            }
        });
    }
);


/**---------------------------------------------------
    * Disable profile  
------------------------------------------------------*/
router.patch('/DisableProfile',
    [
        check('phone').not().isEmpty().trim().escape()    
    ],
    (req, res) => {
        //check validation Errors
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }
        const disableBool = req.body.disable_profile === 'true';
        student.findOneAndUpdate({ 'phone': req.body.phone }, { 'disable_profile': disableBool }, (err, result) => {
            //if error
            if (err) {
                return res.json({
                    status: false,
                    msg: 'Server Error, please contact to Admin',
                    error: err
                });
            }
            //if result is null then email id not found
            if (result === null) {
                return res.json({
                    status: false,
                    msg: 'Record Not Found In DB, Contact Admin...!',
                });
            } else {
                return res.json({
                    status: true,
                    msg: 'Profile Link Updated, It will be shown to student..!',
                });
            }
        });
    }
);

/**
 * Delete Company Detail API
 */
router.delete('/DeleteStudent', (req, res) => {
    if (!ObjectId.isValid(req.body.id)) {
        return res.status(400).json({
            status: false,
            msg: 'Student Not Found.'
        });
    }
    student.findByIdAndDelete(req.body.id, (err, result) => {
        if (err) {
            return res.json({
                status: false,
                msg: 'Database error in deleting the data',
                error: err
            })
        } else if (result == null) {
            return res.json({
                status: false,
                msg: 'Invalid Id',
            })
        } else {
            return res.json({
                status: true,
                msg: 'Student deleted Successfully...',
                res: result
            })
        }
    });
});


//exports module
module.exports = router;
