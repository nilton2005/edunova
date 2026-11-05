import { Router } from 'express';
import { classAlerts } from '../services/analytics.js';

export const analytics = Router();

// GET /api/analytics/explainable-alerts?classId=EDU-402
analytics.get('/explainable-alerts', (req, res) => {
  res.json(classAlerts(typeof req.query.classId === 'string' ? req.query.classId : 'EDU-402'));
});
