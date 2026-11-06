import { Router, type Request } from 'express';
import type { LearningUnit } from '../../../../packages/shared-types/edunova-contract';
import { getUnit, listUnits } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';

export const unitsRouter = Router();

const isTeacher = async (req: Request) => (await currentUser(req))?.role === 'TEACHER';

// Rúbrica oculta: el estudiante ve misiones y preguntas, nunca la tabla del docente.
const forStudents = (unit: LearningUnit): LearningUnit => ({ ...unit, rubric: [] });

unitsRouter.get('/', asyncHandler(async (req, res) => {
  const units = await listUnits();
  if (await isTeacher(req)) return res.json(units);
  res.json(units.filter((u) => u.status === 'PUBLISHED').map(forStudents));
}));

// GET /api/units/:id?ageTier=...  -> LearningUnit (el front elige storyTextByAge[ageTier])
// Un borrador solo lo ve el docente: la IA no publica sola.
unitsRouter.get('/:id', asyncHandler(async (req, res) => {
  const unit = await getUnit(req.params.id);
  const teacher = await isTeacher(req);
  if (!unit || (unit.status !== 'PUBLISHED' && !teacher)) {
    return res.status(404).json({ error: 'Unidad no encontrada' });
  }
  res.json(teacher ? unit : forStudents(unit));
}));
