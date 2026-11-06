import { Router } from 'express';
import { currentUser } from '../services/access.js';
import { classAlerts } from '../services/analytics.js';
import { asyncHandler } from '../services/async-handler.js';

export const analytics = Router();

// GET /api/analytics/explainable-alerts?classId=EDU-402
// Solo docente del aula (401 sin sesión, 403 otro docente)
analytics.get(
  '/explainable-alerts',
  asyncHandler(async (req, res) => {
    const classId = typeof req.query.classId === 'string' ? req.query.classId : undefined;
    if (!classId) return res.status(400).json({ error: 'Falta el parámetro classId' });

    const viewer = await currentUser(req);
    if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
    if (viewer.role !== 'TEACHER' || viewer.classroomCode !== classId) {
      return res.status(403).json({ error: 'Solo el docente de esta aula puede ver estas alertas' });
    }

    res.json(await classAlerts(classId));
  })
);
