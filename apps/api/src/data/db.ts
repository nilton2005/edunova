import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import type {
  GamificationAndBenchmarkProfile,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';
import { masterySeed, profiles as seedProfiles, units as seedUnits, users as seedUsers } from './seed.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Falta configurar la variable de entorno DATABASE_URL');

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? true : undefined,
});

pool.on('error', (error: Error) => {
  console.error('Error en una conexión PostgreSQL inactiva:', error);
});

let initialization: Promise<void> | undefined;

export function initializeDatabase() {
  initialization ??= initialize();
  return initialization;
}

async function seedData(client: PoolClient) {
  for (const user of seedUsers) {
    await client.query('INSERT INTO users (id, json) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [
      user.id,
      JSON.stringify(user),
    ]);
  }

  for (const [seq, unit] of seedUnits.entries()) {
    await client.query(
      'INSERT INTO units (id, seq, json) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [unit.id, seq, JSON.stringify(unit)],
    );
  }

  for (const profile of seedProfiles) {
    await client.query(
      'INSERT INTO profiles (student_id, json) VALUES ($1, $2) ON CONFLICT (student_id) DO NOTHING',
      [profile.studentId, JSON.stringify(profile)],
    );
  }

  for (const mastery of masterySeed) {
    await client.query(
      `INSERT INTO mastery (student_id, criterion_id, percent)
       VALUES ($1, $2, $3) ON CONFLICT (student_id, criterion_id) DO NOTHING`,
      [mastery.studentId, mastery.criterionId, mastery.percent],
    );
  }
}

async function initialize() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, json JSONB NOT NULL);
      CREATE TABLE IF NOT EXISTS units (id TEXT PRIMARY KEY, seq INTEGER NOT NULL, json JSONB NOT NULL);
      CREATE TABLE IF NOT EXISTS profiles (student_id TEXT PRIMARY KEY, json JSONB NOT NULL);
      CREATE TABLE IF NOT EXISTS mastery (
        student_id TEXT NOT NULL,
        criterion_id TEXT NOT NULL,
        percent INTEGER NOT NULL,
        PRIMARY KEY (student_id, criterion_id)
      );
    `);

    await seedData(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function resetDatabase() {
  await initializeDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE mastery, profiles, units, users');
    await seedData(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabase() {
  await pool.end();
}

async function ready() {
  await initializeDatabase();
}

export async function listUsers() {
  await ready();
  const { rows } = await pool.query<{ json: User }>('SELECT json FROM users');
  return rows.map((row) => row.json);
}

export async function listUnits() {
  await ready();
  const { rows } = await pool.query<{ json: LearningUnit }>('SELECT json FROM units ORDER BY seq');
  return rows.map((row) => row.json);
}

export async function getUnit(id: string) {
  await ready();
  const { rows } = await pool.query<{ json: LearningUnit }>('SELECT json FROM units WHERE id = $1', [id]);
  return rows[0]?.json;
}

export async function saveUnit(unit: LearningUnit) {
  await ready();
  const { rows } = await pool.query<{ n: number }>('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM units');
  await pool.query(
    `INSERT INTO units (id, seq, json) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET json = EXCLUDED.json`,
    [unit.id, rows[0].n, JSON.stringify(unit)],
  );
}

export async function listProfiles() {
  await ready();
  const { rows } = await pool.query<{ json: GamificationAndBenchmarkProfile }>('SELECT json FROM profiles');
  return rows.map((row) => row.json);
}

export async function getProfile(studentId: string) {
  await ready();
  const { rows } = await pool.query<{ json: GamificationAndBenchmarkProfile }>(
    'SELECT json FROM profiles WHERE student_id = $1',
    [studentId],
  );
  return rows[0]?.json;
}

export async function saveProfile(profile: GamificationAndBenchmarkProfile) {
  await ready();
  await pool.query('UPDATE profiles SET json = $1 WHERE student_id = $2', [
    JSON.stringify(profile),
    profile.studentId,
  ]);
}

export async function masteryOf(studentId: string) {
  await ready();
  const { rows } = await pool.query<{ criterionId: string; percent: number }>(
    'SELECT criterion_id AS "criterionId", percent FROM mastery WHERE student_id = $1',
    [studentId],
  );
  return rows;
}

export async function addMastery(studentId: string, criterionId: string, delta: number) {
  await ready();
  await pool.query(
    `INSERT INTO mastery (student_id, criterion_id, percent) VALUES ($1, $2, LEAST(100, $3))
     ON CONFLICT (student_id, criterion_id)
     DO UPDATE SET percent = LEAST(100, mastery.percent + $3)`,
    [studentId, criterionId, delta],
  );
}
