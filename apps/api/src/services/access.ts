import type { NextFunction, Request, Response } from 'express';
import { listUsers } from '../data/db.js';

// Control por rol del plan (sección 6). El token es el de demo de /api/auth/login, no está firmado:
// ordena quién ve qué en el demo, pero no es seguridad real.
export function currentUser(req: Request) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token?.startsWith('demo-')) return undefined;
  return listUsers().find((u) => u.id === token.slice('demo-'.length));
}

// Datos de un aula: solo su docente. Un estudiante no ve datos de sus compañeros.
export function requireClassTeacher(req: Request, res: Response, next: NextFunction) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Falta iniciar sesión' });
  if (user.role !== 'TEACHER' || user.classroomCode !== req.params.code) {
    return res.status(403).json({ error: 'Solo el docente de esta aula puede ver estos datos' });
  }
  next();
}
