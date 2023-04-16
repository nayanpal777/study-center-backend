var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('./database/student.db', (err) => {
  if (err) {
      console.log("Getting error " + err);
      exit(1);
  } else {
    console.log("Database created successfully");
    db.run('CREATE TABLE IF NOT EXISTS student(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, class TEXT, Address TEXT)');
    console.log("Table created");
  }
});
module.exports = db;