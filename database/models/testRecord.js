const db = require('../db');

const dbGet = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows[0] ?? null;
};

const dbAll = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows;
};

const dbRun = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return { lastID: Number(result.lastInsertRowid), changes: result.rowsAffected };
};

const getTestRecordById = async (id) => {
  return await dbGet('SELECT * FROM student_test_records WHERE id = ?', [id]);
};

const getTestRecordByStudentAndTest = async (studentId, testNumber) => {
  return await dbGet(
    'SELECT * FROM student_test_records WHERE student_id = ? AND test_number = ?',
    [studentId, testNumber]
  );
};

const getTestRecordsByStudentId = async (studentId) => {
  return await dbAll(
    'SELECT * FROM student_test_records WHERE student_id = ? ORDER BY test_number ASC',
    [studentId]
  );
};

const getAllTestRecordsForDashboard = async ({ board = '', className = '' } = {}) => {
  let sql = `
    SELECT
      s.id AS student_id,
      s.name AS student_name,
      s.board,
      s.class,
      tr.id AS record_id,
      tr.test_number,
      tr.marks,
      tr.max_marks,
      tr.updated_at
    FROM students s
    LEFT JOIN student_test_records tr ON tr.student_id = s.id
  `;

  const params = [];
  const clauses = [];

  if (board) {
    clauses.push('s.board = ?');
    params.push(board);
  }

  if (className) {
    clauses.push('s.class = ?');
    params.push(className);
  }

  if (clauses.length > 0) {
    sql += ' WHERE ' + clauses.join(' AND ');
  }

  sql += ' ORDER BY s.name ASC, tr.test_number ASC';
  return await dbAll(sql, params);
};

const upsertTestRecord = async ({
  student_id,
  student_name,
  board,
  class: cls,
  test_number,
  marks,
  max_marks = 20
}) => {
  const safeMarks = marks === null || marks === undefined || marks === '' ? null : Number(marks);
  const safeMaxMarks = max_marks === null || max_marks === undefined || max_marks === '' ? 20 : Number(max_marks);

  const result = await dbRun(`
    INSERT INTO student_test_records (
      student_id, student_name, board, class, test_number, marks, max_marks, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, test_number)
    DO UPDATE SET
      student_name = excluded.student_name,
      board = excluded.board,
      class = excluded.class,
      marks = excluded.marks,
      max_marks = excluded.max_marks,
      updated_at = CURRENT_TIMESTAMP
  `, [student_id, student_name, board || null, cls || null, test_number, safeMarks, safeMaxMarks]);

  if (result.lastID && result.lastID > 0) {
    return await getTestRecordById(result.lastID);
  }

  return await getTestRecordByStudentAndTest(student_id, test_number);
};

const updateTestRecord = async (id, updateData) => {
  const fields = [];
  const params = [];

  if (updateData.student_name !== undefined) {
    fields.push('student_name = ?');
    params.push(updateData.student_name);
  }

  if (updateData.board !== undefined) {
    fields.push('board = ?');
    params.push(updateData.board);
  }

  if (updateData.class !== undefined) {
    fields.push('class = ?');
    params.push(updateData.class);
  }

  if (updateData.test_number !== undefined) {
    fields.push('test_number = ?');
    params.push(updateData.test_number);
  }

  if (updateData.marks !== undefined) {
    fields.push('marks = ?');
    params.push(updateData.marks);
  }

  if (updateData.max_marks !== undefined) {
    fields.push('max_marks = ?');
    params.push(updateData.max_marks);
  }

  if (fields.length === 0) {
    return await getTestRecordById(id);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  await dbRun(`UPDATE student_test_records SET ${fields.join(', ')} WHERE id = ?`, params);
  return await getTestRecordById(id);
};

const deleteTestRecord = async (id) => {
  await dbRun('DELETE FROM student_test_records WHERE id = ?', [id]);
};

module.exports = {
  getTestRecordById,
  getTestRecordByStudentAndTest,
  getTestRecordsByStudentId,
  getAllTestRecordsForDashboard,
  upsertTestRecord,
  updateTestRecord,
  deleteTestRecord
};
