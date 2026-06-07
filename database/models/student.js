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

// Default subjects by class — returns a hash { subject: 1 } with all enabled
const getDefaultSubjectsByClass = (cls) => {
  if (!cls) return {};
  const normalized = cls.toString().toLowerCase();
  let subjectList;
  if (normalized.includes('11') || normalized.includes('12')) {
    subjectList = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Hindi', 'English'];
  } else {
    subjectList = ['Science', 'Mathematics', 'Hindi', 'English', 'Social Science'];
  }
  return subjectList.reduce((hash, s) => { hash[s] = 0; return hash; }, {});
};

// Create default subject access JSON for a student (stored in students.subjects column)
const createStudentSubjects = async (studentId, cls) => {
  const subjectsHash = getDefaultSubjectsByClass(cls);
  const sql = 'UPDATE students SET subjects = ? WHERE id = ?';
  await dbRun(sql, [JSON.stringify(subjectsHash), studentId]);
  return subjectsHash;
};

// Get subject access hash for a student (parsed from students.subjects JSON column)
const getStudentSubjectsById = async (studentId) => {
  const row = await dbGet('SELECT subjects FROM students WHERE id = ?', [studentId]);
  if (!row || !row.subjects) return {};
  try {
    return JSON.parse(row.subjects);
  } catch {
    return {};
  }
};

// Update the full subjects hash for a student
const upsertStudentSubject = async (studentId, subjectsHash) => {
  const sql = 'UPDATE students SET subjects = ? WHERE id = ?';
  await dbRun(sql, [JSON.stringify(subjectsHash), studentId]);
  return subjectsHash;
};

// Get all 12 months in order
const getAllMonths = () => {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
};

// Create default fee JSON for a student (all 12 months set to "unpaid")
const createStudentFees = async (studentId) => {
  const months = getAllMonths();
  const feesHash = months.reduce((hash, m) => { hash[m] = 'unpaid'; return hash; }, {});
  const sql = 'UPDATE students SET fees = ? WHERE id = ?';
  await dbRun(sql, [JSON.stringify(feesHash), studentId]);
  return feesHash;
};

// Get fee hash for a student (parsed from students.fees JSON column)
const getStudentFeesById = async (studentId) => {
  const row = await dbGet('SELECT fees FROM students WHERE id = ?', [studentId]);
  if (!row || !row.fees) return {};
  try {
    return JSON.parse(row.fees);
  } catch {
    return {};
  }
};

// Update the full fees hash for a student
// feesHash format: { "January": "paid", "February": "unpaid", "March": "not_applicable", ... }
const upsertStudentFee = async (studentId, feesHash) => {
  const validStatuses = ['paid', 'unpaid', 'not_applicable'];
  for (const [month, status] of Object.entries(feesHash)) {
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid fee status "${status}" for month "${month}". Must be one of: paid, unpaid, not_applicable`);
    }
  }
  const sql = 'UPDATE students SET fees = ? WHERE id = ?';
  await dbRun(sql, [JSON.stringify(feesHash), studentId]);
  return feesHash;
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
