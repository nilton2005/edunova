import { Router } from 'express';
import { getUnit, listUnits } from '../data/db.js';

export const unitsRouter = Router();

unitsRouter.get('/', (_req, res) => res.json(listUnits()));

// GET /api/units/:id?ageTier=...  -> LearningUnit (el front elige storyTextByAge[ageTier])
unitsRouter.get('/:id', (req, res) => {
  const unit = getUnit(req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  res.json(unit);
});
