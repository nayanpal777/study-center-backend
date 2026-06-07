//Dashboard Database Model - Turso/libSQL
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
