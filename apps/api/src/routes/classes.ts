import { Router } from 'express';
import { listAssessments } from '../data/db.js';
import { requireClassTeacher } from '../services/access.js';
import { classAnalytics, classStudents } from '../services/analytics.js';
import { asyncHandler } from '../services/async-handler.js';

export const classes = Router();

// GET /api/classes/:code/students  -> ClassStudent[]  (solo docente del aula)
classes.get('/:code/students', requireClassTeacher, asyncHandler(async (req, res) => {
  res.json(await classStudents(req.params.code));
}));

// GET /api/classes/:code/analytics  -> ClassAnalytics  (solo docente del aula)
classes.get('/:code/analytics', requireClassTeacher, asyncHandler(async (req, res) => {
  res.json(await classAnalytics(req.params.code));
}));

// GET /api/classes/:code/assessments  -> AssessmentRecord[]  (solo docente del aula)
classes.get('/:code/assessments', requireClassTeacher, asyncHandler(async (req, res) => {
  res.json(await listAssessments(req.params.code));
}));
