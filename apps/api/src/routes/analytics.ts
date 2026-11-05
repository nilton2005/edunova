import { Router } from 'express';
import { explainableAlerts } from '../data/seed.js';

export const analytics = Router();

// GET /api/analytics/explainable-alerts?classId=EDU-402
analytics.get('/explainable-alerts', (req, res) => {
  const classId = req.query.classId;
  res.json(classId ? explainableAlerts.filter((a) => a.classId === classId) : explainableAlerts);
});
