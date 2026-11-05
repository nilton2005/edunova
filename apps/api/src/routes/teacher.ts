import { Router } from 'express';
import { getUnit, saveUnit } from '../data/db.js';

export const teacher = Router();

// PUT /api/teacher/approve-rubric  body: { unitId, rubric?: RubricCriterion[] }
// La IA nunca publica sola: DRAFT -> PUBLISHED solo con esta llamada.
teacher.put('/approve-rubric', (req, res) => {
  const { unitId, rubric } = req.body ?? {};
  const unit = getUnit(unitId);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  if (Array.isArray(rubric)) unit.rubric = rubric;
  unit.rubric = unit.rubric.map((c) => ({ ...c, approvedByTeacher: true }));
  unit.status = 'PUBLISHED';
  saveUnit(unit);
  res.json(unit);
});
