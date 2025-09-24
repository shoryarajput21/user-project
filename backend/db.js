const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { DATABASE_FILE } = process.env;
const dbPath = DATABASE_FILE ? path.resolve(DATABASE_FILE) : path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin','user')) DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    startTime TEXT,
    endTime TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    eventId INTEGER NOT NULL,
    status TEXT CHECK(status IN ('going','maybe','decline')) NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, eventId),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE
  )`);
});

module.exports = db;
