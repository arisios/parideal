const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'parideal.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      profile_id INTEGER NOT NULL,
      profile_name TEXT NOT NULL,
      q1 INTEGER NOT NULL,
      q2 INTEGER NOT NULL,
      q3 INTEGER NOT NULL,
      q4 INTEGER NOT NULL,
      energia TEXT NOT NULL,
      allow_match INTEGER DEFAULT 0,
      allow_divulgar INTEGER DEFAULT 0,
      foto_path TEXT,
      share_token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_profile_id INTEGER NOT NULL,
      to_profile_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(from_profile_id, to_profile_id),
      FOREIGN KEY (from_profile_id) REFERENCES profiles(id),
      FOREIGN KEY (to_profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_profile_id INTEGER NOT NULL,
      to_profile_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_profile_id) REFERENCES profiles(id),
      FOREIGN KEY (to_profile_id) REFERENCES profiles(id)
    );
  `);

  // Migrações seguras
  const cols = db.prepare("PRAGMA table_info(profiles)").all().map(c => c.name);
  if (!cols.includes('allow_divulgar')) db.exec(`ALTER TABLE profiles ADD COLUMN allow_divulgar INTEGER DEFAULT 0`);
  if (!cols.includes('foto_path'))      db.exec(`ALTER TABLE profiles ADD COLUMN foto_path TEXT`);

  require('../../../../shared/users-db').getUsersDb();
  console.log('✅ Banco Parideal inicializado');
  return db;
}

module.exports = { getDb, initDb };
