import { Router } from 'express';
import { getUnit, listUnits } from '../data/db.js';
import { asyncHandler } from '../services/async-handler.js';

export const unitsRouter = Router();

unitsRouter.get('/', asyncHandler(async (_req, res) => res.json(await listUnits())));

// GET /api/units/:id?ageTier=...  -> LearningUnit (el front elige storyTextByAge[ageTier])
unitsRouter.get('/:id', asyncHandler(async (req, res) => {
  const unit = await getUnit(req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  res.json(unit);
}));
