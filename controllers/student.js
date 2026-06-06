const router = require('express').Router();
const bodyparser = require('body-parser');
const bcryptjs = require('bcryptjs');
const studentModel = require('../database/models/student');
const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  return res.send('Student Module Working fine....');
})

// GET all students
router.get('/students', async (req, res) => {
  try {
    const result = await studentModel.getAllStudents();
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

// GET subject access for a student
router.get('/students/:id/subjects', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: false, msg: 'Invalid student id' });
    }

    const subjects = await studentModel.getStudentSubjectsById(studentId);
    return res.json({ status: true, msg: 'Student subjects', res: subjects });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching student subjects', err: err.message });
  }
});

// PATCH update subject access for a student
router.patch('/students/:id/subjects', [
  check('subject').not().isEmpty().trim().escape(),
  check('enabled').isBoolean()
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: false, msg: 'Invalid Input', err: error.array() });
  }

  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: false, msg: 'Invalid student id' });
    }

    const { subject, enabled } = req.body;
    const updatedSubjects = await studentModel.upsertStudentSubject(studentId, subject, enabled);
    return res.json({ status: true, msg: 'Subject access updated', res: updatedSubjects });
  } catch (err) {
    return res.json({ status: false, msg: 'Error updating subject access', err: err.message });
  }
});

// POST create student
router.post('/createStudent', [
  check('name').not().isEmpty().trim().escape(),
  check('phone').not().isEmpty().trim().escape(),
  check('password').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
  check('board').optional().trim().escape(),
  check('usertype').optional().trim().escape(),
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
    // Check if phone already exists
    const present = await studentModel.getStudentByPhone(req.body.phone);
    if (present) {
      return res.json({
        status: false,
        msg: "Your phone number is already register, Please use different phone number.",
      })
    }

    // Hash password and create student (allow overriding usertype)
    const hashpassword = bcryptjs.hashSync(req.body.password, 10);
    const data = { 
      name: req.body.name,
      phone: req.body.phone, 
      class: req.body.class,
      board: req.body.board,
      password: hashpassword,
      usertype: req.body.usertype || 'student'
    }

    const result = await studentModel.createStudent(data);
    await studentModel.createStudentSubjects(result.id, result.class);
    return res.json({
      status: true,
      msg: 'Data saved successfully.',
      res: result
    })
  } catch (err) {
    // Handle UNIQUE constraint violations
    if (err.message.includes('UNIQUE')) {
      return res.json({
        status: false,
        msg: 'Phone number already exists',
        err: err.message
      })
    }
    return res.json({
      status: false,
      msg: 'Having error while saving your data',
      err: err.message
    })
  }
});

/**---------------------------------------------------
    *Route for Student Login  
------------------------------------------------------*/
router.post('/StudentLogin',
    [
        check('phone').not().isEmpty().trim().escape(),
        check('password').not().isEmpty().trim().escape()
    ], async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        try {
          const studentRecord = await studentModel.getStudentByPhone(req.body.phone);
          if (!studentRecord) {
              return res.json({
                  status: false,
                  msg: 'Phone Not Found please SignUp First...!'
              });
          }

          // Compare password
          const isMatch = await new Promise((resolve, reject) => {
            bcryptjs.compare(req.body.password, studentRecord.password, (err, match) => {
              if (err) reject(err);
              else resolve(match);
            });
          });

          if (!isMatch) {
              return res.json({
                  status: false,
                  msg: 'Invalid Password'
              });
          }

          return res.status(200).json({
              status: true,
              msg: 'Login Sucessfully....',
              data: studentRecord
          });
        } catch (err) {
          return res.json({
            status: false,
            msg: 'Server error during login',
            err: err.message
          });
        }
    });

/**---------------------------------------------------
    * Forgot password API  
------------------------------------------------------*/
router.put('/forgotpassword',
    [
        check('phone').not().isEmpty().trim().escape(),
        check('password').not().isEmpty().trim().escape()
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        try {
          // Hash new password
          const hashpassword = bcryptjs.hashSync(req.body.password, 10);
          const result = await studentModel.updateStudentPassword(req.body.phone, hashpassword);
          
          if (result === null) {
              return res.json({
                  status: false,
                  msg: 'Phone Not Found please SignUp First...!',
              });
          }

          return res.json({
              status: true,
              msg: 'password change successfully....!',
          });
        } catch (err) {
          return res.json({
              status: false,
              msg: 'Server Error, please contact to Admin',
              error: err.message
          });
        }
    }
);

/**---------------------------------------------------
    * Update Profile Link API  
------------------------------------------------------*/
router.patch('/UpdateProfileLink',
    [
        check('phone').not().isEmpty().trim().escape()    
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        try {
          const result = await studentModel.updateProfileLink(req.body.phone, req.body.profile_link);
          
          if (result === null) {
              return res.json({
                  status: false,
                  msg: 'Record Not Found In DB, Contact Admin...!',
              });
          }

          return res.json({
              status: true,
              msg: 'Profile Link Updated, It will be shown to student..!',
          });
        } catch (err) {
          return res.json({
              status: false,
              msg: 'Server Error, please contact to Admin',
              error: err.message
          });
        }
    }
);

/**---------------------------------------------------
    * Disable profile  
------------------------------------------------------*/
router.patch('/DisableProfile',
    [
        check('phone').not().isEmpty().trim().escape()    
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json({
                status: false,
                msg: 'Invalid Input....!',
                err: error.array()
            });
        }

        try {
          const disableBool = req.body.disable_profile === 'true';
          const result = await studentModel.toggleDisableProfile(req.body.phone, disableBool);
          
          if (result === null) {
              return res.json({
                  status: false,
                  msg: 'Record Not Found In DB, Contact Admin...!',
              });
          }

          return res.json({
              status: true,
              msg: 'Profile status updated successfully..!',
          });
        } catch (err) {
          return res.json({
              status: false,
              msg: 'Server Error, please contact to Admin',
              error: err.message
          });
        }
    }
);

/**
 * Delete Student API
 */
router.delete('/DeleteStudent', async (req, res) => {
    // Validate that id is a valid number (for SQLite)
    if (!req.body.id || isNaN(req.body.id)) {
        return res.status(400).json({
            status: false,
            msg: 'Student Not Found.'
        });
    }

    try {
      const result = await studentModel.deleteStudentById(req.body.id);
      
      if (result === null) {
          return res.json({
              status: false,
              msg: 'Invalid Id',
          })
      }

      return res.json({
          status: true,
          msg: 'Student deleted Successfully...',
          res: result
      })
    } catch (err) {
      return res.json({
          status: false,
          msg: 'Database error in deleting the data',
          error: err.message
      })
    }
});

//exports module
module.exports = router;
