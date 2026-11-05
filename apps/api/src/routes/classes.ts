import { Router } from 'express';
import { requireClassTeacher } from '../services/access.js';
import { classAnalytics, classStudents } from '../services/analytics.js';

export const classes = Router();

// GET /api/classes/:code/students  -> ClassStudent[]  (solo docente del aula)
classes.get('/:code/students', requireClassTeacher, (req, res) => {
  res.json(classStudents(req.params.code));
});

// GET /api/classes/:code/analytics  -> ClassAnalytics  (solo docente del aula)
classes.get('/:code/analytics', requireClassTeacher, (req, res) => {
  res.json(classAnalytics(req.params.code));
});
