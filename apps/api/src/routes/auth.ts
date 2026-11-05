import { Router } from 'express';
import type { UserRole } from '../../../../packages/shared-types/edunova-contract';
import { listProfiles, listUsers } from '../data/db.js';
import { asyncHandler } from '../services/async-handler.js';

export const auth = Router();

const ROLE_HOME: Record<UserRole, string> = {
  TEACHER: '/docente',
  FAMILY_TUTOR: '/familia',
  STUDENT: '/estudiante',
};

// POST /api/auth/login  body: { userId } o { alias, classroomCode }
// Sin registro real: solo usuarios de prueba (issue #3).
// El tutor familiar no tiene aula propia, así que para él no se valida el código.
auth.post('/login', asyncHandler(async (req, res) => {
  const { userId, alias, classroomCode } = req.body ?? {};
  const cleanAlias = typeof alias === 'string' ? alias.trim().toLowerCase() : '';
  const cleanCode = typeof classroomCode === 'string' ? classroomCode.trim().toUpperCase() : '';

  const user = (await listUsers()).find((u) => {
    if (userId) return u.id === userId;
    if (!cleanAlias || u.alias.trim().toLowerCase() !== cleanAlias) return false;
    return !cleanCode || !u.classroomCode || u.classroomCode.toUpperCase() === cleanCode;
  });
  if (!user) {
    return res.status(401).json({
      error: 'Usuario no encontrado. Prueba con Profe Ana, Gloria, Mateo, Sofía o Mamá de Gloria (aula EDU-402).',
    });
  }

  const linkedStudentId =
    user.role === 'FAMILY_TUTOR'
      ? (await listProfiles()).find((p) => p.familyTutorLinkedId === user.id)?.studentId
      : undefined;

  res.json({ user, token: `demo-${user.id}`, redirectUrl: ROLE_HOME[user.role], linkedStudentId });
}));

auth.get('/users', asyncHandler(async (_req, res) => res.json(await listUsers())));
