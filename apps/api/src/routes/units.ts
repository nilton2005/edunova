import { Router, type Request } from 'express';
import type { LearningUnit } from '../../../../packages/shared-types/edunova-contract';
import { getUnit, listUnits } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';

export const unitsRouter = Router();

// Rúbrica y errores comunes ocultos: el estudiante ve misiones y preguntas, nunca la tabla del docente ni los errores de cada opción.
const forStudents = (unit: LearningUnit): LearningUnit => ({
  ...unit,
  rubric: [],
  subtopics: unit.subtopics.map((s) => ({
    ...s,
    stages: {
      ...s.stages,
      demonstrate: {
        ...s.stages.demonstrate,
        questions: s.stages.demonstrate.questions.map((q) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { mistakes, ...rest } = q;
          return rest;
        }),
      },
    },
  })),
});

unitsRouter.get('/', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  const units = await listUnits();

  const visibleUnits = units.filter((u) => {
    if (u.familyStudentId) {
      if (!viewer) return false;
      if (viewer.id === u.teacherId) return true; // la familia dueña
      if (viewer.id === u.familyStudentId) return u.status === 'PUBLISHED'; // el estudiante solo si está publicada
      return false; // nadie más, tampoco el docente
    }
    if (viewer?.role === 'TEACHER') return true;
    return u.status === 'PUBLISHED';
  });

  const isTeacher = viewer?.role === 'TEACHER';
  res.json(visibleUnits.map((u) => (isTeacher && !u.familyStudentId ? u : forStudents(u))));
}));

// GET /api/units/:id?ageTier=...  -> LearningUnit (el front elige storyTextByAge[ageTier])
// Un borrador solo lo ve el docente: la IA no publica sola.
unitsRouter.get('/:id', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  const unit = await getUnit(req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });

  if (unit.familyStudentId) {
    if (!viewer) return res.status(404).json({ error: 'Unidad no encontrada' });
    const isOwnerFamily = viewer.id === unit.teacherId;
    const isTargetStudent = viewer.id === unit.familyStudentId && unit.status === 'PUBLISHED';
    if (!isOwnerFamily && !isTargetStudent) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }
    return res.json(isOwnerFamily ? unit : forStudents(unit));
  }

  const teacher = viewer?.role === 'TEACHER';
  if (unit.status !== 'PUBLISHED' && !teacher) {
    return res.status(404).json({ error: 'Unidad no encontrada' });
  }
  res.json(teacher ? unit : forStudents(unit));
}));
