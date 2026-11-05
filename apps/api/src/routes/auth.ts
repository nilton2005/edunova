import { Router } from 'express';
import { users } from '../data/seed.js';

export const auth = Router();

function getRedirectUrl(role: string): string {
  switch (role) {
    case 'TEACHER':
      return '/docente';
    case 'FAMILY_TUTOR':
      return '/familia';
    case 'STUDENT':
    default:
      return '/estudiante';
  }
}

// POST /api/auth/login  body: { userId } o { alias, classroomCode } o { role }
// Sin registro real: solo usuarios de prueba (issue #3).
auth.post('/login', (req, res) => {
  const { userId, alias, classroomCode, role } = req.body ?? {};

  const cleanAlias = typeof alias === 'string' ? alias.trim().toLowerCase() : '';
  const cleanCode = typeof classroomCode === 'string' ? classroomCode.trim().toUpperCase() : '';

  const user = users.find((u) => {
    if (userId && u.id === userId) return true;
    if (role && !alias && !userId && u.role === role) return true;
    if (cleanAlias && u.alias.trim().toLowerCase() === cleanAlias) {
      if (!cleanCode) return true;
      return u.classroomCode?.toUpperCase() === cleanCode;
    }
    return false;
  });

  if (!user) {
    return res.status(401).json({
      error: 'Usuario no encontrado. Prueba con Profe Ana, Gloria, Mateo, Sofía o Mamá de Gloria (Aula EDU-402).',
    });
  }

  res.json({
    user,
    token: `demo-${user.id}`,
    redirectUrl: getRedirectUrl(user.role),
  });
});

// GET /api/auth/me - Devuelve el usuario autenticado según header o query
auth.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || (req.query.token as string);

  if (token && token.startsWith('demo-')) {
    const userId = token.replace('demo-', '');
    const user = users.find((u) => u.id === userId);
    if (user) {
      return res.json({ user, redirectUrl: getRedirectUrl(user.role) });
    }
  }

  // Fallback si no hay token o no se encuentra: retornar el primer estudiante por defecto
  res.json({ user: users[1], redirectUrl: '/estudiante' });
});

// GET /api/auth/users - Lista todos los usuarios demo
auth.get('/users', (_req, res) => {
  const usersWithRedirect = users.map((u) => ({
    ...u,
    redirectUrl: getRedirectUrl(u.role),
  }));
  res.json(usersWithRedirect);
});
