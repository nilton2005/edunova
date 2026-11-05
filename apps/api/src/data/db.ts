import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  GamificationAndBenchmarkProfile,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';
import { masterySeed, profiles as seedProfiles, units as seedUnits, users as seedUsers } from './seed.js';

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
  CREATE TABLE IF NOT EXISTS mastery  (
    student_id TEXT NOT NULL,
    criterion_id TEXT NOT NULL,
    percent INTEGER NOT NULL,
    PRIMARY KEY (student_id, criterion_id)
  );
`);

// INSERT OR IGNORE: agrega lo nuevo de la semilla sin pisar el progreso ya guardado.
function seed() {
  const tx = db.transaction(() => {
    const insUser = db.prepare('INSERT OR IGNORE INTO users (id, json) VALUES (?, ?)');
    for (const u of seedUsers) insUser.run(u.id, JSON.stringify(u));

    const insUnit = db.prepare('INSERT OR IGNORE INTO units (id, seq, json) VALUES (?, ?, ?)');
    seedUnits.forEach((u, i) => insUnit.run(u.id, i, JSON.stringify(u)));

    const insProfile = db.prepare('INSERT OR IGNORE INTO profiles (student_id, json) VALUES (?, ?)');
    for (const p of seedProfiles) insProfile.run(p.studentId, JSON.stringify(p));

    const insMastery = db.prepare('INSERT OR IGNORE INTO mastery (student_id, criterion_id, percent) VALUES (?, ?, ?)');
    for (const m of masterySeed) insMastery.run(m.studentId, m.criterionId, m.percent);
  });
  tx();
}
seed();

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

// ---- Dominio por criterio de rúbrica (RF-02) ----
export const masteryOf = (studentId: string) =>
  db.prepare('SELECT criterion_id AS criterionId, percent FROM mastery WHERE student_id = ?').all(studentId) as Array<{
    criterionId: string;
    percent: number;
  }>;

export function addMastery(studentId: string, criterionId: string, delta: number) {
  db.prepare(
    `INSERT INTO mastery (student_id, criterion_id, percent) VALUES (@studentId, @criterionId, MIN(100, @delta))
     ON CONFLICT(student_id, criterion_id) DO UPDATE SET percent = MIN(100, percent + @delta)`,
  ).run({ studentId, criterionId, delta });
}
