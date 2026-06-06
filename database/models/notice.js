// Notice Database Model - SQLite3
const db = require('../db');

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const createNotice = async ({ message, board, class: cls }) => {
  const sql = `INSERT INTO notices (message, board, class, created_at)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;

  const result = await dbRun(sql, [message, board || null, cls || null]);
  return await dbGet('SELECT * FROM notices WHERE id = ?', [result.lastID]);
};

const getNoticesForStudent = async (student) => {
  const sql = `SELECT * FROM notices
               WHERE (board IS NULL OR board = '' OR board = ?)
                 AND (class IS NULL OR class = '' OR class = ?)
               ORDER BY created_at DESC`;
  return await dbAll(sql, [student.board || '', student.class || '']);
};

const getAllNotices = async () => {
  return await dbAll('SELECT * FROM notices ORDER BY created_at DESC');
};

const deleteNotice = async (noticeId) => {
  const sql = 'DELETE FROM notices WHERE id = ?';
  await dbRun(sql, [noticeId]);
};

module.exports = {
  createNotice,
  getNoticesForStudent,
  getAllNotices,
  deleteNotice,
};
