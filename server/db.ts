import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/game.db'
  : path.join(__dirname, 'game.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL REFERENCES users(id),
    score     INTEGER NOT NULL,
    played_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
`);

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Score {
  id: number;
  user_id: number;
  score: number;
  played_at: string;
}

export const queries = {
  findUserByUsername: db.prepare<[string], User>('SELECT * FROM users WHERE username = ?'),
  createUser: db.prepare<[string, string]>('INSERT INTO users (username, password) VALUES (?, ?)'),
  insertScore: db.prepare<[number, number]>('INSERT INTO scores (user_id, score) VALUES (?, ?)'),
  getScoresByUser: db.prepare<[number], Score>(
    'SELECT * FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 20'
  ),
  getBestScore: db.prepare<[number], { best: number | null }>(
    'SELECT MAX(score) as best FROM scores WHERE user_id = ?'
  ),
};
