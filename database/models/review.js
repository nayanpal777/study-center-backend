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
