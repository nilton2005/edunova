import { Router } from 'express';
import { getAssessment, getUnit, saveAlertAction, saveAssessment, saveUnit } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';

export const teacher = Router();

// PUT /api/teacher/approve-rubric  body: { unitId, rubric?: RubricCriterion[] }
// La IA nunca publica sola: DRAFT -> PUBLISHED solo con esta llamada.
teacher.put('/approve-rubric', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });

  const { unitId, rubric } = req.body ?? {};
  const unit = await getUnit(unitId);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  if (viewer.role !== 'TEACHER' || viewer.classroomCode !== unit.classroomCode) {
    return res.status(403).json({ error: 'Solo el docente de esta aula puede publicar' });
  }
  if (Array.isArray(rubric)) unit.rubric = rubric;
  unit.rubric = unit.rubric.map((c) => ({ ...c, approvedByTeacher: true }));
  unit.status = 'PUBLISHED';
  await saveUnit(unit);
  res.json(unit);
}));

const MAX_SCORE = 20;

// PUT /api/teacher/assessments/:id/override  body: { score: number | null }
// RF-04: el docente reemplaza la nota de la IA. Con null se vuelve a la nota de la IA.
teacher.put('/assessments/:id/override', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });

  const assessment = await getAssessment(req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Evaluación no encontrada' });
  if (viewer.role !== 'TEACHER' || viewer.classroomCode !== assessment.classroomCode) {
    return res.status(403).json({ error: 'Solo el docente de esta aula puede cambiar la nota' });
  }

  const { score } = req.body ?? {};
  const valid = score === null || (typeof score === 'number' && score >= 0 && score <= MAX_SCORE);
  if (!valid) return res.status(400).json({ error: `La nota debe estar entre 0 y ${MAX_SCORE}` });

  assessment.teacherOverrideScore = score;
  await saveAssessment(assessment);
  res.json(assessment);
}));

// PUT /api/teacher/alerts/:id/attended
// Marca una alerta como atendida por el docente del aula
teacher.put(
  '/alerts/:id/attended',
  asyncHandler(async (req, res) => {
    const viewer = await currentUser(req);
    if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
    if (viewer.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Solo un docente puede atender alertas' });
    }

    const alertId = req.params.id;
    // La alerta tiene formato al-${classId}-...
    if (!viewer.classroomCode || !alertId.startsWith(`al-${viewer.classroomCode}-`)) {
      return res.status(403).json({ error: 'Esta alerta no pertenece a tu aula' });
    }

    const attendedAt = new Date().toISOString();
    await saveAlertAction(alertId, viewer.id, attendedAt);
    res.json({ ok: true, alertId, attendedAt });
  })
);

// PUT /api/teacher/units/:id/share  body: { shared: boolean }
// Comparte o deja de compartir una unidad publicada con las familias
teacher.put('/units/:id/share', asyncHandler(async (req, res) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
  if (viewer.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Solo un docente puede compartir unidades con familias' });
  }

  const unit = await getUnit(req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  if (unit.teacherId !== viewer.id) {
    return res.status(403).json({ error: 'Solo el docente dueño de la unidad puede compartirla' });
  }
  if (unit.status !== 'PUBLISHED') {
    return res.status(400).json({ error: 'Solo se pueden compartir unidades publicadas' });
  }

  const { shared } = req.body ?? {};
  if (typeof shared !== 'boolean') {
    return res.status(400).json({ error: 'El campo shared debe ser booleano' });
  }

  unit.sharedWithFamilies = shared;
  await saveUnit(unit);
  res.json(unit);
}));
