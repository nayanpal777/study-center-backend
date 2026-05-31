//Student Database Model - SQLite3
const db = require('../db');

// Promisify db.get() for async queries
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.all() for async queries
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promisify db.run() for async mutations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Get all students
const getAllStudents = async () => {
  return await dbAll('SELECT * FROM students');
};

// Get student by phone
const getStudentByPhone = async (phone) => {
  return await dbGet('SELECT * FROM students WHERE phone = ?', [phone]);
};

// Get student by email
const getStudentByEmail = async (email) => {
  return await dbGet('SELECT * FROM students WHERE email = ?', [email]);
};

// Get student by id
const getStudentById = async (id) => {
  return await dbGet('SELECT * FROM students WHERE id = ?', [id]);
};

// Create a new student
const createStudent = async (studentData) => {
  const sql = `INSERT INTO students (name, phone, password, class, usertype, profile_link, disable_profile)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    studentData.name,
    studentData.phone,
    studentData.password,
    studentData.class,
    studentData.usertype || 'student',
    studentData.profile_link || null,
    studentData.disable_profile || 0
  ];
  
  const result = await dbRun(sql, params);
  // Return the created student with id
  return await getStudentById(result.lastID);
};

// Update student password
const updateStudentPassword = async (phone, hashedPassword) => {
  const sql = 'UPDATE students SET password = ? WHERE phone = ?';
  const result = await dbRun(sql, [hashedPassword, phone]);
  
  // Return updated student if found
  if (result.changes > 0) {
    return await getStudentByPhone(phone);
  }
  return null;
};

// Update profile link
const updateProfileLink = async (phone, profileLink) => {
  const sql = 'UPDATE students SET profile_link = ? WHERE phone = ?';
  const result = await dbRun(sql, [profileLink, phone]);
  
  if (result.changes > 0) {
    return await getStudentByPhone(phone);
  }
  return null;
};

// Toggle disable profile status
const toggleDisableProfile = async (phone, disableStatus) => {
  const sql = 'UPDATE students SET disable_profile = ? WHERE phone = ?';
  const result = await dbRun(sql, [disableStatus ? 1 : 0, phone]);
  
  if (result.changes > 0) {
    return await getStudentByPhone(phone);
  }
  return null;
};

// Delete student by id
const deleteStudentById = async (id) => {
  const student = await getStudentById(id);
  if (student) {
    await dbRun('DELETE FROM students WHERE id = ?', [id]);
    return student;
  }
  return null;
};

module.exports = {
  getAllStudents,
  getStudentByPhone,
  getStudentById,
  createStudent,
  updateStudentPassword,
  updateProfileLink,
  toggleDisableProfile,
  deleteStudentById
};
