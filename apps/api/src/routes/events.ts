import { Router } from 'express';
import type { EventActivity, LearningEvent } from '../../../../packages/shared-types/edunova-contract';
import { saveLearningEvent } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { recordObservation } from '../services/analytics.js';
import { asyncHandler } from '../services/async-handler.js';

export const events = Router();

const MAX_EVENTS = 200;
const MAX_TIME_MS = 60 * 60 * 1000;
const ACTIVITIES: EventActivity[] = ['FLASHCARD', 'QUIZ', 'LAB_3D'];

const count = (value: unknown, fallback: number) =>
  Number.isInteger(value) && (value as number) >= 0 ? (value as number) : fallback;

function parseEvent(raw: Partial<LearningEvent>): LearningEvent | undefined {
  if (typeof raw?.id !== 'string' || !raw.id || raw.id.length > 80) return undefined;
  if (!ACTIVITIES.includes(raw.activity as EventActivity) || typeof raw.correct !== 'boolean') return undefined;
  const occurredAt = new Date(raw.occurredAt ?? '');
  return {
    id: raw.id,
    activity: raw.activity as EventActivity,
    correct: raw.correct,
    subtopicId: typeof raw.subtopicId === 'string' ? raw.subtopicId.slice(0, 120) : undefined,
    questionId: typeof raw.questionId === 'string' ? raw.questionId.slice(0, 120) : undefined,
    attempt: Math.max(1, count(raw.attempt, 1)),
    hintsUsed: count(raw.hintsUsed, 0),
    timeMs: Math.min(MAX_TIME_MS, count(raw.timeMs, 0)),
    occurredAt: Number.isNaN(occurredAt.getTime()) ? new Date().toISOString() : occurredAt.toISOString(),
  };
}

// POST /api/events  body: { events: LearningEvent[] }  -> { accepted, duplicates, rejected }
// El estudiante sale de la sesión, no del cuerpo. El id del evento lo genera el cliente: reenviar
// una cola sin conexión no duplica la evidencia ni el dominio.
events.post('/', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
  if (viewer.role !== 'STUDENT') return res.status(403).json({ error: 'Solo los estudiantes registran actividad' });

  const list: unknown = req.body?.events;
  if (!Array.isArray(list) || list.length > MAX_EVENTS) {
    return res.status(400).json({ error: `Se esperan hasta ${MAX_EVENTS} eventos` });
  }

  const summary = { accepted: 0, duplicates: 0, rejected: 0 };
  // En orden: cada respuesta actualiza el dominio que dejó la anterior.
  for (const raw of list as Array<Partial<LearningEvent>>) {
    const event = parseEvent(raw);
    if (!event) {
      summary.rejected += 1;
      continue;
    }
    if (!(await saveLearningEvent(viewer.id, event))) {
      summary.duplicates += 1;
      continue;
    }
    summary.accepted += 1;
    await recordObservation(viewer.id, event);
  }
  res.json(summary);
}));
