import { Router } from 'express';
import type { LearningUnit } from '@edunova/shared-types';
import { fractionsUnit, handwrittenFallback, solarSystemUnit, units } from '../data/seed.js';
import { detectLab, simulate } from '../services/ai.js';

// Todos los endpoints de IA son simulados (sin API key). Ver services/ai.ts.
export const ai = Router();

// POST /api/ai/ingest-document  body: { title?, text }  -> LearningUnit en DRAFT
// Simulación: elige la unidad semilla según palabras clave del texto.
ai.post('/ingest-document', async (req, res) => {
  const { title, text = '' } = req.body ?? {};
  const base = await simulate(() =>
    structuredClone(detectLab(`${title ?? ''} ${text}`) === 'SOLAR_SYSTEM' ? solarSystemUnit : fractionsUnit),
  );
  const unit: LearningUnit = {
    ...base,
    id: `unit-${Date.now()}`,
    title: title ?? base.title,
    status: 'DRAFT',
    rubric: base.rubric.map((c) => ({ ...c, approvedByTeacher: false })),
  };
  units.push(unit);
  res.json({ ...unit, usedFallback: true });
});

// POST /api/ai/analyze-handwritten-photo  body: { imageBase64?, explanation? }
// Simulación: siempre analiza la hoja de prueba "1/3 + 1/4".
ai.post('/analyze-handwritten-photo', async (req, res) => {
  const { explanation } = req.body ?? {};
  const result = await simulate(() => ({
    ...handwrittenFallback,
    reasoningBonusXP: explanation ? handwrittenFallback.reasoningBonusXP : 0,
  }));
  res.json(result);
});

// POST /api/ai/validate-duel-question  body: { question, topic }
ai.post('/validate-duel-question', async (req, res) => {
  const { question = '' } = req.body ?? {};
  const result = await simulate(() =>
    String(question).trim().length >= 10
      ? { valid: true, reason: 'La pregunta tiene sustento en el tema.' }
      : { valid: false, reason: 'La pregunta es muy corta. Agrega más detalle del tema.' },
  );
  res.json(result);
});

// POST /api/ai/family-home-explainer  body: { topic?, errorType? }
ai.post('/family-home-explainer', async (req, res) => {
  const { topic = 'las fracciones' } = req.body ?? {};
  const result = await simulate(() => ({
    explanation: `Para explicar ${topic} en casa: usa una pizza. Pártela en 4 partes iguales y come 1: ya comiste 1/4. Pregúntale qué fracción queda. Si suma 1/3 + 1/4, muéstrale que primero hay que cortar las dos pizzas en 12 partes.`,
  }));
  res.json(result);
});
