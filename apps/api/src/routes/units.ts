import { Router } from 'express';
import { units } from '../data/seed.js';

export const unitsRouter = Router();

unitsRouter.get('/', (_req, res) => res.json(units));

// GET /api/units/:id?ageTier=...  -> LearningUnit (el front elige storyTextByAge[ageTier])
unitsRouter.get('/:id', (req, res) => {
  const unit = units.find((u) => u.id === req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  res.json(unit);
});
