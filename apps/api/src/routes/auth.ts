import { Router } from 'express';
import { listUsers } from '../data/db.js';
import { asyncHandler } from '../services/async-handler.js';

export const auth = Router();

// POST /api/auth/login  body: { userId } o { alias, classroomCode }
// Sin registro real: solo usuarios de prueba (issue #3).
auth.post('/login', asyncHandler(async (req, res) => {
  const { userId, alias, classroomCode } = req.body ?? {};
  const user = (await listUsers()).find(
    (u) => (userId && u.id === userId) || (alias && u.alias === alias && (!classroomCode || u.classroomCode === classroomCode)),
  );
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  res.json({ user, token: `demo-${user.id}` });
}));

auth.get('/users', asyncHandler(async (_req, res) => res.json(await listUsers())));
