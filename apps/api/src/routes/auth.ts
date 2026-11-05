import { Router } from 'express';
import { users } from '../data/seed.js';

export const auth = Router();

// POST /api/auth/login  body: { userId } o { alias, classroomCode }
// Sin registro real: solo usuarios de prueba (issue #3).
auth.post('/login', (req, res) => {
  const { userId, alias, classroomCode } = req.body ?? {};
  const user = users.find(
    (u) => (userId && u.id === userId) || (alias && u.alias === alias && (!classroomCode || u.classroomCode === classroomCode)),
  );
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  res.json({ user, token: `demo-${user.id}` });
});

auth.get('/users', (_req, res) => res.json(users));
