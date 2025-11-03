import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "app.db");

fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  // Create comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    body TEXT,
    ts INTEGER,
    payload_type TEXT
  )`);

  // --- Seed users only if empty ---
  db.get(`SELECT COUNT(*) as cnt FROM users`, (err, row: any) => {
    if (err) {
      console.error("Error checking users count", err);
    } else if (row && row.cnt === 0) {
      db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
      db.run(`INSERT INTO users (username, password) VALUES ('alice', 'alicepwd')`);
    }
  });

  // --- Seed a single comment only if empty ---
  db.get(`SELECT COUNT(*) as cnt FROM comments`, (err, row: any) => {
    if (err) {
      console.error("Error checking comments count", err);
    } else if (row && row.cnt === 0) {
      db.run(
        `INSERT INTO comments (author, body, ts, payload_type)
         VALUES ('alice', 'Hello world!', strftime('%s','now'), 'text')`
      );
    }
  });
});

// ensure close happens after short delay to allow async inserts
setTimeout(() => {
  db.close();
  console.log(`✅ Database initialized at ${dbPath}`);
}, 300);
