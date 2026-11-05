import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  GamificationAndBenchmarkProfile,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';
import { profiles as seedProfiles, units as seedUnits, users as seedUsers } from './seed.js';

// Persistencia SQLite (#2). Cada entidad se guarda como JSON para conservar la forma del contrato.
// Archivo: apps/api/data/edunova.db (ignorado por git). DB_PATH=:memory: para pruebas.
// Para reiniciar con la semilla: borrar el archivo, o `npm run db:reset`.

const dbPath = process.env.DB_PATH ?? 'data/edunova.db';
if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users    (id TEXT PRIMARY KEY, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS units    (id TEXT PRIMARY KEY, seq INTEGER NOT NULL, json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS profiles (student_id TEXT PRIMARY KEY, json TEXT NOT NULL);
`);

function seedIfEmpty() {
  const count = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
  const tx = db.transaction(() => {
    if (count('users') === 0) {
      const ins = db.prepare('INSERT INTO users (id, json) VALUES (?, ?)');
      for (const u of seedUsers) ins.run(u.id, JSON.stringify(u));
    }
    if (count('units') === 0) {
      const ins = db.prepare('INSERT INTO units (id, seq, json) VALUES (?, ?, ?)');
      seedUnits.forEach((u, i) => ins.run(u.id, i, JSON.stringify(u)));
    }
    if (count('profiles') === 0) {
      const ins = db.prepare('INSERT INTO profiles (student_id, json) VALUES (?, ?)');
      for (const p of seedProfiles) ins.run(p.studentId, JSON.stringify(p));
    }
  });
  tx();
}
seedIfEmpty();

const parse = <T>(row: { json: string } | undefined): T | undefined => (row ? (JSON.parse(row.json) as T) : undefined);

// ---- Usuarios ----
export const listUsers = () =>
  (db.prepare('SELECT json FROM users').all() as { json: string }[]).map((r) => JSON.parse(r.json) as User);

// ---- Unidades ----
export const listUnits = () =>
  (db.prepare('SELECT json FROM units ORDER BY seq').all() as { json: string }[]).map((r) => JSON.parse(r.json) as LearningUnit);

export const getUnit = (id: string) =>
  parse<LearningUnit>(db.prepare('SELECT json FROM units WHERE id = ?').get(id) as { json: string } | undefined);

export function saveUnit(unit: LearningUnit) {
  const next = (db.prepare('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM units').get() as { n: number }).n;
  db.prepare(
    `INSERT INTO units (id, seq, json) VALUES (@id, @seq, @json)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json`,
  ).run({ id: unit.id, seq: next, json: JSON.stringify(unit) });
}

// ---- Perfiles de gamificación ----
export const listProfiles = () =>
  (db.prepare('SELECT json FROM profiles').all() as { json: string }[]).map(
    (r) => JSON.parse(r.json) as GamificationAndBenchmarkProfile,
  );

export const getProfile = (studentId: string) =>
  parse<GamificationAndBenchmarkProfile>(
    db.prepare('SELECT json FROM profiles WHERE student_id = ?').get(studentId) as { json: string } | undefined,
  );

export function saveProfile(profile: GamificationAndBenchmarkProfile) {
  db.prepare('UPDATE profiles SET json = ? WHERE student_id = ?').run(JSON.stringify(profile), profile.studentId);
}
