import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'scim-viewer.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS environments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tokenEndpoint TEXT NOT NULL,
    scope TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS app_environment_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicationId INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    environmentId INTEGER NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    clientId TEXT NOT NULL,
    clientSecret TEXT NOT NULL,
    scimBaseUrl TEXT NOT NULL,
    scope TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (applicationId, environmentId)
  );
`);

export function touchUpdatedAt(table: string, id: number): void {
  db.prepare(`UPDATE ${table} SET updatedAt = datetime('now') WHERE id = ?`).run(id);
}
