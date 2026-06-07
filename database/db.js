const { createClient } = require('@libsql/client');

// Disable TLS certificate verification in local development only.
// Turso uses a certificate chain that Windows/Node.js may reject locally.
// On Render (NODE_ENV=production) this is NOT set and TLS is fully verified.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create Turso/libSQL database client
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Function to initialize database schema (create tables if they don't exist)
const initializeDatabase = async () => {
  try {
    // Create Students table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        class TEXT NOT NULL,
        board TEXT,
        usertype TEXT DEFAULT 'student',
        profile_link TEXT,
        disable_profile INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Students table ready');

    // Create index on phone for faster lookups
    await db.execute('CREATE INDEX IF NOT EXISTS idx_phone ON students(phone)');

    // Create Dashboard table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dashboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        class TEXT NOT NULL,
        permission INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Dashboard table ready');

    // Create index on email for faster lookups
    await db.execute('CREATE INDEX IF NOT EXISTS idx_dashboard_email ON dashboard(email)');

    // Create Student Subjects table for per-student course access control
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject),
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log('Student subjects table ready');

    // Create Student Fees table for monthly fee tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        status TEXT DEFAULT 'Unpaid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, month),
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log('Student fees table ready');

    // Create Notices table for admin-to-student messages
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        board TEXT,
        class TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Notices table ready');

    // Create Reviews table for student testimonials
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        class TEXT NOT NULL,
        board TEXT NOT NULL,
        review_text TEXT NOT NULL,
        rating INTEGER NOT NULL,
        approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Reviews table ready');

    // Migration guard: add approved column if it doesn't exist (for legacy databases)
    const pragmaResult = await db.execute(`SELECT name FROM pragma_table_info('reviews') WHERE name = 'approved'`);
    if (pragmaResult.rows.length === 0) {
      await db.execute('ALTER TABLE reviews ADD COLUMN approved INTEGER DEFAULT 0');
      console.log('Reviews table upgraded with approved column.');
    }

    console.log('Turso database connection successful and schema initialized.');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
};

// Initialize schema on startup
initializeDatabase();

module.exports = db;
