const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file location
const DB_PATH = path.join(__dirname, 'study_center.db');

// Create/open SQLite3 database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database Connection Failed....', err);
  } else {
    console.log('SQLite3 Database Connection Successful....');
    // Initialize database schema on startup
    initializeDatabase();
  }
});

// Function to initialize database schema (create tables if they don't exist)
const initializeDatabase = () => {
  db.serialize(() => {
    // Create Students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        class TEXT NOT NULL,
        usertype TEXT DEFAULT 'student',
        profile_link TEXT,
        disable_profile INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `, (err) => {
      if (err) {
        console.error('Error creating students table:', err);
      } else {
        console.log('Students table ready');
        // Create index on phone for faster lookups
        db.run('CREATE INDEX IF NOT EXISTS idx_phone ON students(phone);');
      }
    });

    // Create Dashboard table
    db.run(`
      CREATE TABLE IF NOT EXISTS dashboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        class TEXT NOT NULL,
        permission INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `, (err) => {
      if (err) {
        console.error('Error creating dashboard table:', err);
      } else {
        console.log('Dashboard table ready');
        // Create index on email for faster lookups
        db.run('CREATE INDEX IF NOT EXISTS idx_dashboard_email ON dashboard(email);');
      }
    });
  });
};

module.exports = db;
