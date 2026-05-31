//Dashboard Database Model - SQLite3
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

// Get all dashboard records
const getAllDashboard = async () => {
  return await dbAll('SELECT * FROM dashboard');
};

// Get dashboard record by email
const getDashboardByEmail = async (email) => {
  return await dbGet('SELECT * FROM dashboard WHERE email = ?', [email]);
};

// Get dashboard record by id
const getDashboardById = async (id) => {
  return await dbGet('SELECT * FROM dashboard WHERE id = ?', [id]);
};

// Create a new dashboard record
const createDashboardRecord = async (dashboardData) => {
  const sql = `INSERT INTO dashboard (name, email, class, permission)
               VALUES (?, ?, ?, ?)`;
  
  const params = [
    dashboardData.name,
    dashboardData.email,
    dashboardData.class,
    dashboardData.permission || 0
  ];
  
  const result = await dbRun(sql, params);
  // Return the created record with id
  return await getDashboardById(result.lastID);
};

module.exports = {
  getAllDashboard,
  getDashboardByEmail,
  getDashboardById,
  createDashboardRecord
};
