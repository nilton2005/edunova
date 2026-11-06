import { Router, type NextFunction, type Request, type Response } from 'express';
import type {
  FamilyCategory,
  FamilyDraftResponse,
  LearningUnit,
  SharedFamilyRoute,
  User,
} from '../../../../packages/shared-types/edunova-contract';
import { getUnit, listProfiles, listUnits, saveUnit } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { attachPictograms } from '../services/arasaac.js';
import { asyncHandler } from '../services/async-handler.js';
import { generateJson, hasGemini, takeAiCall, type GeminiPart } from '../services/gemini.js';
import {
  DRAFT_SCHEMA,
  FAMILY_DRAFT_INSTRUCTIONS,
  removeHealthRisks,
  toLearningUnit,
  type RawDraft,
} from '../services/unitDraft.js';

export const family = Router();

// Por debajo de los 30 s en que corta el proxy de Next, contando la búsqueda de pictogramas.
const FAMILY_DRAFT_TIMEOUT_MS = 24_000;
const VALID_CATEGORIES: FamilyCategory[] = [
  'CAMPO_Y_LUGAR',
  'SALUD_Y_PLANTAS',
  'COCINA',
  'OFICIOS_Y_HOGAR',
  'AHORRO',
  'IDIOMAS',
  'OTRO',
];

const requireFamily = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión como familia' });
  if (viewer.role !== 'FAMILY_TUTOR') {
    return res.status(403).json({ error: 'Solo los tutores familiares pueden acceder a esta sección' });
  }
  res.locals.viewer = viewer;
  next();
});

// POST /api/family/units/draft
family.post('/units/draft', requireFamily, asyncHandler(async (req, res) => {
  const viewer = res.locals.viewer as User;
  const { category, text, title } = (req.body ?? {}) as {
    category?: unknown;
    text?: unknown;
    title?: unknown;
  };

  if (!category || typeof category !== 'string' || !VALID_CATEGORIES.includes(category as FamilyCategory)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'El texto es obligatorio' });
  }

  const trimmedText = text.trim().slice(0, 4000);
  const titleParam = typeof title === 'string' && title.trim() ? title.trim().slice(0, 120) : undefined;

  // El hijo se obtiene con listProfiles buscando familyTutorLinkedId === viewer.id. Sin hijo vinculado, 404.
  const profiles = await listProfiles();
  const childProfile = profiles.find((p) => p.familyTutorLinkedId === viewer.id);
  if (!childProfile) {
    return res.status(404).json({ error: 'No se encontró un estudiante vinculado a este tutor familiar' });
  }
  const familyStudentId = childProfile.studentId;

  // safetyNote la pone el servidor, nunca la IA
  let safetyNote: string | undefined;
  if (category === 'SALUD_Y_PLANTAS') {
    safetyNote =
      'Este es un saber de tu familia, no un consejo médico. Nunca pruebes una planta sin un adulto. Si alguien está enfermo, vayan a la posta de salud.';
  } else if (category === 'COCINA' || category === 'OFICIOS_Y_HOGAR') {
    safetyNote = 'Hazlo siempre con un adulto a tu lado.';
  }

  const unitId = `unit-family-${Date.now()}`;
  let finalUnit: LearningUnit | undefined;
  let usedFallback = false;
  let aiNotice: string | undefined;

  if (hasGemini() && takeAiCall()) {
    try {
      const parts: GeminiPart[] = [
        { text: `Categoría familiar: ${category}` },
        ...(titleParam ? [{ text: `Título sugerido por la familia: ${titleParam}` }] : []),
        { text: `Saber compartido por la familia:\n${trimmedText}` },
      ];
      const { value } = await generateJson<RawDraft>(parts, FAMILY_DRAFT_INSTRUCTIONS, DRAFT_SCHEMA, FAMILY_DRAFT_TIMEOUT_MS);
      const generated = toLearningUnit(value, {
        id: unitId,
        fallbackTitle: titleParam,
        teacherId: viewer.id,
        classroomCode: '',
      });
      await attachPictograms(generated);
      // El modelo podría proponer un laboratorio: en un saber de casa nunca aplica.
      for (const subtopic of generated.subtopics) subtopic.lab3DIntegration.type = 'NONE';
      finalUnit = {
        ...generated,
        status: 'DRAFT',
        teacherId: viewer.id,
        classroomCode: '',
        familyStudentId,
        familyCategory: category as FamilyCategory,
        safetyNote,
        rubric: [],
      };
    } catch (error) {
      console.error('Saberes de casa con IA:', error instanceof Error ? error.message : error);
      usedFallback = true;
      aiNotice = 'La IA no pudo ordenar la lección en este momento. Se preparó un borrador con tu texto.';
    }
  } else {
    usedFallback = true;
    aiNotice = hasGemini()
      ? 'La IA está saturada en este momento. Se preparó un borrador con tu texto.'
      : 'Servicio de IA no disponible. Se preparó un borrador con tu texto.';
  }

  // Si la IA falla o no hay key: crea una unidad de un subtema con el texto de la familia tal cual, sin preguntas
  if (!finalUnit) {
    const subtopicId = `st-${unitId}-1`;
    finalUnit = {
      id: unitId,
      title: titleParam || 'Saber de mi familia',
      status: 'DRAFT',
      teacherId: viewer.id,
      classroomCode: '',
      familyStudentId,
      familyCategory: category as FamilyCategory,
      safetyNote,
      rubric: [],
      subtopics: [
        {
          id: subtopicId,
          order: 1,
          title: '1. Saber compartido en familia',
          status: 'IN_PROGRESS',
          offlineCached: false,
          lab3DIntegration: {
            type: 'NONE',
            repoUrl: '',
            missionPrompt: '',
            rewardXP: 100,
            rewardCoins: 30,
          },
          stages: {
            discover: {
              storyTextByAge: {
                EXPLORADOR_7_9: trimmedText,
                AVENTURERO_10_12: trimmedText,
                CREADOR_13_15: trimmedText,
              },
              audioUrl: '',
            },
            practice: {
              flashcards: [],
              gameMode: 'flashcards',
            },
            demonstrate: {
              questions: [],
              acceptsHandwrittenPhoto: false,
              reasoningBonusXP: 0,
            },
          },
        },
      ],
    };
  }

  const removedHealthRisks = category === 'SALUD_Y_PLANTAS' && removeHealthRisks(finalUnit);

  await saveUnit(finalUnit);
  const response: FamilyDraftResponse = {
    unit: finalUnit,
    usedFallback,
    aiNotice,
    safetyNotice: removedHealthRisks
      ? 'Por seguridad quitamos las cantidades y las frases que prometen curar. Esas partes enséñalas tú, en persona.'
      : undefined,
  };
  res.json(response);
}));

// GET /api/family/units: las unidades con teacherId === viewer.id.
family.get('/units', requireFamily, asyncHandler(async (req, res) => {
  const viewer = res.locals.viewer as User;
  const units = (await listUnits()).filter((u) => u.teacherId === viewer.id);
  res.json(units);
}));

// PUT /api/family/units/:id/publish: solo la familia dueña, pasa a PUBLISHED. Otra familia, 403.
family.put('/units/:id/publish', requireFamily, asyncHandler(async (req, res) => {
  const viewer = res.locals.viewer as User;
  const unit = await getUnit(req.params.id);
  if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
  if (unit.teacherId !== viewer.id) {
    return res.status(403).json({ error: 'Solo la familia dueña puede publicar esta unidad' });
  }
  unit.status = 'PUBLISHED';
  await saveUnit(unit);
  res.json(unit);
}));

// GET /api/family/routes
// Unidades publicadas por docentes que fueron compartidas con familias
family.get('/routes', requireFamily, asyncHandler(async (_req, res) => {
  const units = await listUnits();
  const sharedRoutes: SharedFamilyRoute[] = units
    .filter((u) => u.status === 'PUBLISHED' && Boolean(u.sharedWithFamilies))
    .map((u) => ({
      id: u.id,
      title: u.title,
      familyCategory: u.familyCategory,
      subtopicsCount: u.subtopics.length,
    }));
  res.json(sharedRoutes);
}));

// POST /api/family/routes/:id/assign
// Asigna una copia de la ruta docente al hijo del tutor familiar
family.post('/routes/:id/assign', requireFamily, asyncHandler(async (req, res) => {
  const viewer = res.locals.viewer as User;

  const profiles = await listProfiles();
  const childProfile = profiles.find((p) => p.familyTutorLinkedId === viewer.id);
  if (!childProfile) {
    return res.status(404).json({ error: 'No se encontró un estudiante vinculado a este tutor familiar' });
  }
  const childStudentId = childProfile.studentId;

  // Si ya existe una copia de esa ruta para ese hijo, devuélvela sin crear otra
  const allUnits = await listUnits();
  const existing = allUnits.find(
    (u) => u.sourceUnitId === req.params.id && u.familyStudentId === childStudentId,
  );
  if (existing) {
    return res.json(existing);
  }

  const sourceUnit = await getUnit(req.params.id);
  if (!sourceUnit || sourceUnit.status !== 'PUBLISHED' || !sourceUnit.sharedWithFamilies) {
    return res.status(404).json({ error: 'Ruta docente no encontrada o no disponible para familias' });
  }

  // Copia con structuredClone a un id nuevo
  const newUnit: LearningUnit = structuredClone(sourceUnit);
  newUnit.id = `unit-assigned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  newUnit.familyStudentId = childStudentId;
  newUnit.teacherId = viewer.id;
  newUnit.classroomCode = '';
  newUnit.rubric = [];
  newUnit.sharedWithFamilies = false;
  newUnit.sourceUnitId = sourceUnit.id;
  newUnit.status = 'PUBLISHED';
  // El dominio se busca por subtema: con los ids del original, practicar en casa cambiaría el dominio del aula.
  for (const subtopic of newUnit.subtopics) {
    subtopic.id = `${newUnit.id}-${subtopic.id}`;
    for (const question of subtopic.stages.demonstrate.questions) {
      question.id = `${newUnit.id}-${question.id}`;
      question.rubricCriterionId = '';
    }
  }

  await saveUnit(newUnit);
  res.json(newUnit);
}));
