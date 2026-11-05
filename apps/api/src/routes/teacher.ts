import { Router } from 'express';
import { units } from '../data/seed.js';

export const teacher = Router();

// PUT /api/teacher/approve-rubric  body: { unitId, rubric?: RubricCriterion[] }
// La IA nunca publica sola: DRAFT -> PUBLISHED solo con esta llamada.
teacher.put('/approve-rubric', (req, res) => {
  const { unitId, rubric } = req.body ?? {};
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  if (Array.isArray(rubric)) unit.rubric = rubric;
  unit.rubric = unit.rubric.map((c) => ({ ...c, approvedByTeacher: true }));
  unit.status = 'PUBLISHED';
  res.json(unit);
});
