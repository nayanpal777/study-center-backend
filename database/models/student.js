//Student Database Model - Turso/libSQL
const db = require('../db');

// Execute query and return single row
const dbGet = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows[0] ?? null;
};

// Execute query and return all rows
const dbAll = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows;
};

// Execute mutation and return lastID + changes
const dbRun = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return { lastID: Number(result.lastInsertRowid), changes: result.rowsAffected };
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
  const sql = `INSERT INTO students (name, phone, password, class, board, usertype, profile_link, disable_profile)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    studentData.name,
    studentData.phone,
    studentData.password,
    studentData.class,
    studentData.board || null,
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

// Default subjects by class
const getDefaultSubjectsByClass = (cls) => {
  if (!cls) return [];
  const normalized = cls.toString().toLowerCase();
  if (normalized.includes('11') || normalized.includes('12')) {
    return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Hindi', 'English'];
  }
  return ['Science', 'Mathematics', 'Hindi', 'English', 'Social Science'];
};

// Create default subject access records for a student
const createStudentSubjects = async (studentId, cls) => {
  const subjects = getDefaultSubjectsByClass(cls);
  if (!subjects.length) return [];

  const insertPromises = subjects.map((subject) => {
    const sql = `INSERT OR IGNORE INTO student_subjects (student_id, subject, enabled) VALUES (?, ?, ?)`;
    return dbRun(sql, [studentId, subject, 1]);
  });

  await Promise.all(insertPromises);
  return await getStudentSubjectsById(studentId);
};

// Get subject access list for a student
const getStudentSubjectsById = async (studentId) => {
  return await dbAll('SELECT subject, enabled FROM student_subjects WHERE student_id = ?', [studentId]);
};

// Toggle a subject access state for a student
const upsertStudentSubject = async (studentId, subject, enabled) => {
  const sql = `INSERT INTO student_subjects (student_id, subject, enabled)
               VALUES (?, ?, ?)
               ON CONFLICT(student_id, subject) DO UPDATE SET enabled = excluded.enabled`;
  await dbRun(sql, [studentId, subject, enabled ? 1 : 0]);
  return await getStudentSubjectsById(studentId);
};

// Get all 12 months
const getAllMonths = () => {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
};

// Create default fee records for a student (all 12 months set to Unpaid)
const createStudentFees = async (studentId) => {
  const months = getAllMonths();
  const insertPromises = months.map((month) => {
    const sql = `INSERT OR IGNORE INTO student_fees (student_id, month, status) VALUES (?, ?, ?)`;
    return dbRun(sql, [studentId, month, 'Unpaid']);
  });

  await Promise.all(insertPromises);
  return await getStudentFeesById(studentId);
};

// Get fee records for a student
const getStudentFeesById = async (studentId) => {
  return await dbAll('SELECT month, status FROM student_fees WHERE student_id = ? ORDER BY student_fees.rowid', [studentId]);
};

// Update a fee status for a student
const upsertStudentFee = async (studentId, month, status) => {
  const validStatuses = ['Paid', 'Unpaid', 'Not applicable'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid fee status');
  }

  const sql = `INSERT INTO student_fees (student_id, month, status)
               VALUES (?, ?, ?)
               ON CONFLICT(student_id, month) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP`;
  await dbRun(sql, [studentId, month, status]);
  return await getStudentFeesById(studentId);
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
  getDefaultSubjectsByClass,
  createStudentSubjects,
  getStudentSubjectsById,
  upsertStudentSubject,
  getAllMonths,
  createStudentFees,
  getStudentFeesById,
  upsertStudentFee,
  deleteStudentById
};
