// Review Database Model - Turso/libSQL
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

const createReview = async ({ student_name, class: cls, board, review_text, rating }) => {
  const result = await dbRun(
    `INSERT INTO reviews (student_name, class, board, review_text, rating, approved, created_at)
     VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [student_name, cls, board, review_text, rating]
  );
  return await getReviewById(result.lastID);
};

const getAllReviews = async () => {
  return await dbAll('SELECT * FROM reviews ORDER BY created_at DESC');
};

const getReviewsByApproval = async (approved) => {
  return await dbAll(
    'SELECT * FROM reviews WHERE approved = ? ORDER BY created_at DESC',
    [approved ? 1 : 0]
  );
};

const getReviewById = async (reviewId) => {
  return await dbGet('SELECT * FROM reviews WHERE id = ?', [reviewId]);
};

const updateReview = async (reviewId, data) => {
  const existing = await getReviewById(reviewId);
  if (!existing) {
    return null;
  }

  const studentName = data.student_name || existing.student_name;
  const cls = data.class || existing.class;
  const board = data.board || existing.board;
  const reviewText = data.review_text || existing.review_text;
  const rating = data.rating !== undefined ? data.rating : existing.rating;
  const approved = data.approved !== undefined ? (data.approved ? 1 : 0) : existing.approved;

  await dbRun(
    `UPDATE reviews SET student_name = ?, class = ?, board = ?, review_text = ?, rating = ?, approved = ? WHERE id = ?`,
    [studentName, cls, board, reviewText, rating, approved, reviewId]
  );

  return await getReviewById(reviewId);
};

const deleteReview = async (reviewId) => {
  await dbRun('DELETE FROM reviews WHERE id = ?', [reviewId]);
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByApproval,
  getReviewById,
  updateReview,
  deleteReview,
};
