const router = require('express').Router();
const bodyparser = require('body-parser');
const bcryptjs = require('bcryptjs');
const studentModel = require('../database/models/student');
const noticeModel = require('../database/models/notice');
const reviewModel = require('../database/models/review');
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

// GET notices for a student by id and filters
router.get('/students/:id/notices', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: false, msg: 'Invalid student id' });
    }

    const student = await studentModel.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ status: false, msg: 'Student not found' });
    }

    const notices = await noticeModel.getNoticesForStudent(student);
    return res.json({ status: true, msg: 'Student notices', res: notices });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching notices', err: err.message });
  }
});

// POST create notice targeted by board/class
router.post('/notices', [
  check('message').not().isEmpty().trim().escape(),
  check('board').optional().trim().escape(),
  check('class').optional().trim().escape()
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: false, msg: 'Invalid Input', err: error.array() });
  }

  try {
    const notice = await noticeModel.createNotice({
      message: req.body.message,
      board: req.body.board || null,
      class: req.body.class || null
    });

    return res.json({ status: true, msg: 'Notice published successfully', res: notice });
  } catch (err) {
    return res.json({ status: false, msg: 'Error publishing notice', err: err.message });
  }
});

// GET all notices for admin
router.get('/notices', async (req, res) => {
  try {
    const notices = await noticeModel.getAllNotices();
    return res.json({ status: true, msg: 'All notices', res: notices });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching notices', err: err.message });
  }
});

// DELETE a notice by id
router.delete('/notices/:id', async (req, res) => {
  try {
    const noticeId = parseInt(req.params.id, 10);
    if (isNaN(noticeId)) {
      return res.status(400).json({ status: false, msg: 'Invalid notice id' });
    }

    await noticeModel.deleteNotice(noticeId);
    return res.json({ status: true, msg: 'Notice deleted successfully' });
  } catch (err) {
    return res.json({ status: false, msg: 'Error deleting notice', err: err.message });
  }
});

// REVIEW CRUD
router.get('/reviews', async (req, res) => {
  try {
    const approvedParam = req.query.approved;
    const reviews = approvedParam !== undefined
      ? await reviewModel.getReviewsByApproval(approvedParam === '1' || approvedParam === 'true')
      : await reviewModel.getAllReviews();

    return res.json({ status: true, msg: 'Reviews loaded', res: reviews });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching reviews', err: err.message });
  }
});

router.get('/reviews/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) {
      return res.status(400).json({ status: false, msg: 'Invalid review id' });
    }

    const review = await reviewModel.getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ status: false, msg: 'Review not found' });
    }

    return res.json({ status: true, msg: 'Review details', res: review });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching review', err: err.message });
  }
});

router.post('/reviews', [
  check('student_name').not().isEmpty().trim().escape(),
  check('class').not().isEmpty().trim().escape(),
  check('board').not().isEmpty().trim().escape(),
  check('review_text').not().isEmpty().trim(),
  check('rating').isInt({ min: 1, max: 5 })
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: false, msg: 'Invalid Input', err: error.array() });
  }

  try {
    const review = await reviewModel.createReview({
      student_name: req.body.student_name,
      class: req.body.class,
      board: req.body.board,
      review_text: req.body.review_text,
      rating: parseInt(req.body.rating, 10)
    });

    return res.json({ status: true, msg: 'Review created successfully', res: review });
  } catch (err) {
    return res.json({ status: false, msg: 'Error creating review', err: err.message });
  }
});

router.patch('/reviews/:id', [
  check('student_name').optional().trim().escape(),
  check('class').optional().trim().escape(),
  check('board').optional().trim().escape(),
  check('review_text').optional().trim(),
  check('rating').optional().isInt({ min: 1, max: 5 }),
  check('approved').optional().isBoolean()
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: false, msg: 'Invalid Input', err: error.array() });
  }

  try {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) {
      return res.status(400).json({ status: false, msg: 'Invalid review id' });
    }

    const updatedReview = await reviewModel.updateReview(reviewId, {
      student_name: req.body.student_name,
      class: req.body.class,
      board: req.body.board,
      review_text: req.body.review_text,
      rating: req.body.rating !== undefined ? parseInt(req.body.rating, 10) : undefined,
      approved: req.body.approved !== undefined ? Boolean(req.body.approved) : undefined
    });

    return res.json({ status: true, msg: 'Review updated successfully', res: updatedReview });
  } catch (err) {
    return res.json({ status: false, msg: 'Error updating review', err: err.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) {
      return res.status(400).json({ status: false, msg: 'Invalid review id' });
    }

    await reviewModel.deleteReview(reviewId);
    return res.json({ status: true, msg: 'Review deleted successfully' });
  } catch (err) {
    return res.json({ status: false, msg: 'Error deleting review', err: err.message });
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

// GET fee records for a student
router.get('/students/:id/fees', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ status: false, msg: 'Invalid student id' });
    }

    const fees = await studentModel.getStudentFeesById(studentId);
    return res.json({ status: true, msg: 'Student fees', res: fees });
  } catch (err) {
    return res.json({ status: false, msg: 'Error fetching student fees', err: err.message });
  }
});

// PATCH update fee status for a student
router.patch('/students/:id/fees', [
  check('month').not().isEmpty().trim().escape(),
  check('status').not().isEmpty().trim().escape()
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

    const { month, status } = req.body;
    const updatedFees = await studentModel.upsertStudentFee(studentId, month, status);
    return res.json({ status: true, msg: 'Fee status updated', res: updatedFees });
  } catch (err) {
    return res.json({ status: false, msg: 'Error updating fee status', err: err.message });
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
    await studentModel.createStudentFees(result.id);
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
