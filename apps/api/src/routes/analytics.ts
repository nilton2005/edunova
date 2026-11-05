import { Router } from 'express';
import { classAlerts } from '../services/analytics.js';
import { asyncHandler } from '../services/async-handler.js';

export const analytics = Router();

// GET /api/analytics/explainable-alerts?classId=EDU-402
analytics.get('/explainable-alerts', asyncHandler(async (req, res) => {
  res.json(await classAlerts(typeof req.query.classId === 'string' ? req.query.classId : 'EDU-402'));
}));
