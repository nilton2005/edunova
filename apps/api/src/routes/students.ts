import { Router } from 'express';
import type { StudentProfile } from '../../../../packages/shared-types/edunova-contract';
import { getProfile, listUsers } from '../data/db.js';
import { aliasByStudent } from '../data/seed.js';
import { currentUser } from '../services/access.js';
import { overallProgress, weakestTopic } from '../services/analytics.js';
import { asyncHandler } from '../services/async-handler.js';

export const students = Router();

// GET /api/students/:id/profile  -> StudentProfile
// Lo ven el propio estudiante, su tutor vinculado y el docente de su aula.
students.get('/:id/profile', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });

  const profile = await getProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  const student = (await listUsers()).find((u) => u.id === profile.studentId);

  const allowed =
    viewer.id === profile.studentId ||
    viewer.id === profile.familyTutorLinkedId ||
    (viewer.role === 'TEACHER' && !!viewer.classroomCode && viewer.classroomCode === student?.classroomCode);
  if (!allowed) return res.status(403).json({ error: 'No puedes ver el perfil de este estudiante' });

  const body: StudentProfile = {
    ...profile,
    alias: student?.alias ?? aliasByStudent[profile.studentId],
    ageTier: student?.ageTier,
    classroomCode: student?.classroomCode,
    overallProgressPercent: await overallProgress(profile.studentId),
    // El estudiante no lo recibe: la rúbrica es oculta para él.
    topicToReinforce: viewer.id === profile.studentId ? undefined : await weakestTopic(profile.studentId),
  };
  res.json(body);
}));
