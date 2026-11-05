import { Router } from 'express';
import type { LearningUnit } from '../../../../packages/shared-types/edunova-contract';
import { fractionsUnit, handwrittenFallback, solarSystemUnit, units } from '../data/seed.js';
import { detectLab, withFallback } from '../services/ai.js';

export const ai = Router();

// POST /api/ai/ingest-document  body: { title?, text }  -> LearningUnit en DRAFT
// TODO issue #4: aceptar PDF (multipart), extraer texto y llamar al LLM.
ai.post('/ingest-document', async (req, res) => {
  const { title, text = '' } = req.body ?? {};
  const { value, usedFallback } = await withFallback<LearningUnit>(null, () => {
    const base = detectLab(`${title ?? ''} ${text}`) === 'SOLAR_SYSTEM' ? solarSystemUnit : fractionsUnit;
    return structuredClone(base);
  });
  const unit: LearningUnit = {
    ...value,
    id: `unit-${Date.now()}`,
    title: title ?? value.title,
    status: 'DRAFT',
    rubric: value.rubric.map((c) => ({ ...c, approvedByTeacher: false })),
  };
  units.push(unit);
  res.json({ ...unit, usedFallback });
});

// POST /api/ai/analyze-handwritten-photo  body: { imageBase64?, explanation? }
// TODO issue #12: modelo multimodal. Hoy siempre responde el respaldo.
ai.post('/analyze-handwritten-photo', async (req, res) => {
  const { explanation } = req.body ?? {};
  const { value } = await withFallback(null, () => ({
    ...handwrittenFallback,
    reasoningBonusXP: explanation ? handwrittenFallback.reasoningBonusXP : 0,
  }));
  res.json(value);
});

// POST /api/ai/validate-duel-question  body: { question, topic }
ai.post('/validate-duel-question', async (req, res) => {
  const { question = '' } = req.body ?? {};
  const { value } = await withFallback(null, () =>
    String(question).trim().length >= 10
      ? { valid: true, reason: 'La pregunta tiene sustento en el tema.' }
      : { valid: false, reason: 'La pregunta es muy corta. Agrega más detalle del tema.' },
  );
  res.json(value);
});

// POST /api/ai/family-home-explainer  body: { topic?, errorType? }
ai.post('/family-home-explainer', async (req, res) => {
  const { topic = 'las fracciones' } = req.body ?? {};
  const { value } = await withFallback(null, () => ({
    explanation: `Para explicar ${topic} en casa: usa una pizza. Pártela en 4 partes iguales y come 1: ya comiste 1/4. Pregúntale qué fracción queda. Si suma 1/3 + 1/4, muéstrale que primero hay que cortar las dos pizzas en 12 partes.`,
  }));
  res.json(value);
});
