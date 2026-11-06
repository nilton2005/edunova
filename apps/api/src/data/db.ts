import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import type {
  AssessmentRecord,
  GamificationAndBenchmarkProfile,
  LearningEvent,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';
import { buildSeedLearningEvents, masterySeed, profiles as seedProfiles, units as seedUnits, users as seedUsers } from './seed.js';

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

  for (const { studentId, event } of buildSeedLearningEvents()) {
    await client.query(
      `INSERT INTO learning_events (id, student_id, occurred_at, json)
       VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [`${studentId}:${event.id}`, studentId, event.occurredAt, JSON.stringify(event)],
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
      CREATE TABLE IF NOT EXISTS learning_events (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        json JSONB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS learning_events_student ON learning_events (student_id, occurred_at);
      CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        classroom_code TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        json JSONB NOT NULL
      );
      CREATE TABLE IF NOT EXISTS alert_actions (
        alert_id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        attended_at TIMESTAMPTZ NOT NULL
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
    await client.query('TRUNCATE TABLE assessments, mastery, profiles, units, users');
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

// Bloquea el perfil mientras cambia: dos peticiones a la vez no se pisan las recompensas.
export async function updateProfile(
  studentId: string,
  change: (profile: GamificationAndBenchmarkProfile) => void,
) {
  await ready();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ json: GamificationAndBenchmarkProfile }>(
      'SELECT json FROM profiles WHERE student_id = $1 FOR UPDATE',
      [studentId],
    );
    const profile = rows[0]?.json;
    if (profile) {
      change(profile);
      await client.query('UPDATE profiles SET json = $1 WHERE student_id = $2', [JSON.stringify(profile), studentId]);
    }
    await client.query('COMMIT');
    return profile;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function masteryOf(studentId: string) {
  await ready();
  const { rows } = await pool.query<{ criterionId: string; percent: number }>(
    'SELECT criterion_id AS "criterionId", percent FROM mastery WHERE student_id = $1',
    [studentId],
  );
  return rows;
}

export async function setMastery(studentId: string, criterionId: string, percent: number) {
  await ready();
  await pool.query(
    `INSERT INTO mastery (student_id, criterion_id, percent) VALUES ($1, $2, $3)
     ON CONFLICT (student_id, criterion_id) DO UPDATE SET percent = EXCLUDED.percent`,
    [studentId, criterionId, percent],
  );
}

/** Guarda el evento. Devuelve false si ese id ya estaba: un reenvío no cuenta dos veces. */
export async function saveLearningEvent(studentId: string, event: LearningEvent) {
  await ready();
  const { rowCount } = await pool.query(
    `INSERT INTO learning_events (id, student_id, occurred_at, json) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [`${studentId}:${event.id}`, studentId, event.occurredAt, JSON.stringify(event)],
  );
  return rowCount === 1;
}

export async function saveAssessment(assessment: AssessmentRecord) {
  await ready();
  await pool.query(
    `INSERT INTO assessments (id, classroom_code, json) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET json = EXCLUDED.json`,
    [assessment.id, assessment.classroomCode ?? null, JSON.stringify(assessment)],
  );
}

export async function getAssessment(id: string) {
  await ready();
  const { rows } = await pool.query<{ json: AssessmentRecord }>('SELECT json FROM assessments WHERE id = $1', [id]);
  return rows[0]?.json;
}

export async function listAssessments(classroomCode: string) {
  await ready();
  const { rows } = await pool.query<{ json: AssessmentRecord }>(
    'SELECT json FROM assessments WHERE classroom_code = $1 ORDER BY created_at DESC',
    [classroomCode],
  );
  return rows.map((row) => row.json);
}

export async function lastEventByStudent(studentIds: string[]): Promise<Map<string, string>> {
  await ready();
  if (!studentIds.length) return new Map();
  const { rows } = await pool.query<{ student_id: string; last_event: Date }>(
    `SELECT student_id, MAX(occurred_at) AS last_event
     FROM learning_events
     WHERE student_id = ANY($1)
     GROUP BY student_id`,
    [studentIds],
  );
  return new Map(rows.map((r) => [r.student_id, r.last_event.toISOString()]));
}

export async function saveAlertAction(alertId: string, teacherId: string, attendedAt: string = new Date().toISOString()) {
  await ready();
  await pool.query(
    `INSERT INTO alert_actions (alert_id, teacher_id, attended_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (alert_id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id, attended_at = EXCLUDED.attended_at`,
    [alertId, teacherId, attendedAt],
  );
}

export async function listAlertActions(): Promise<Map<string, string>> {
  await ready();
  const { rows } = await pool.query<{ alert_id: string; attended_at: Date }>(
    'SELECT alert_id, attended_at FROM alert_actions',
  );
  return new Map(rows.map((r) => [r.alert_id, r.attended_at.toISOString()]));
}

export interface StoredStudentEvent {
  studentId: string;
  occurredAt: string;
  event: LearningEvent;
}

export async function eventsOfStudents(studentIds: string[]): Promise<StoredStudentEvent[]> {
  await ready();
  if (!studentIds.length) return [];
  const { rows } = await pool.query<{ student_id: string; occurred_at: string; json: LearningEvent }>(
    `SELECT student_id, occurred_at::text, json
     FROM learning_events
     WHERE student_id = ANY($1)
     ORDER BY occurred_at ASC`,
    [studentIds],
  );
  return rows.map((r) => ({
    studentId: r.student_id,
    occurredAt: r.occurred_at,
    event: r.json,
  }));
}
