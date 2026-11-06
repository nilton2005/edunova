import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { AssessmentRecord, HandwrittenAnalysis } from '../../../../packages/shared-types/edunova-contract';
import { getProfile, listUsers, saveAssessment, updateProfile } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';

export const assess = Router();

const MAX_SCORE = 20;

// POST /api/assess/submit-reasoning  body: { studentId, analysis, reasoning? }
// Guarda la nota de la IA para que el docente la revise y suma el bono por explicar los pasos.
assess.post('/submit-reasoning', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });

  const { studentId, analysis, reasoning } = (req.body ?? {}) as {
    studentId?: string;
    analysis?: HandwrittenAnalysis;
    reasoning?: string;
  };
  if (viewer.id !== studentId) return res.status(403).json({ error: 'Solo puedes enviar tus propias evaluaciones' });
  if (!Array.isArray(analysis?.steps) || !analysis.steps.length) {
    return res.status(400).json({ error: 'Falta el análisis de la hoja' });
  }

  const profile = await getProfile(viewer.id);
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const explanation = reasoning?.trim() || undefined;
  const bonus = explanation ? Math.max(0, Number(analysis.reasoningBonusXP) || 0) : 0;
  const student = (await listUsers()).find((u) => u.id === viewer.id);
  const errors = analysis.steps.filter((s) => s.verdict !== 'CORRECT');

  const record: AssessmentRecord = {
    id: randomUUID(),
    studentId: viewer.id,
    alias: viewer.alias,
    classroomCode: student?.classroomCode,
    source: 'HANDWRITTEN_PHOTO',
    aiScore: Math.round(((analysis.steps.length - errors.length) / analysis.steps.length) * MAX_SCORE),
    teacherOverrideScore: null,
    stepsToReview: errors.length,
    firstErrorFeedback: errors[0]?.feedback,
    reasoning: explanation,
    reasoningBonusXP: bonus,
    createdAt: new Date().toISOString(),
  };
  await saveAssessment(record);

  await updateProfile(profile.studentId, (p) => {
    p.leagues.effortPoints += bonus;
  });
  res.json(record);
}));
