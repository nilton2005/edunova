import { Router, type NextFunction, type Request, type Response } from 'express';
import type { AgeTier, DiagnosticResult } from '../../../../packages/shared-types/edunova-contract';
import { DIAGNOSTIC_QUESTIONS, getPublicDiagnosticQuestions } from '../data/diagnostic.js';
import { updateProfile } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';

export const diagnostic = Router();

async function requireStudent(req: Request, res: Response, next: NextFunction) {
  const viewer = await currentUser(req);
  if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
  if (viewer.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Solo un estudiante puede realizar el diagnóstico' });
  }
  res.locals.viewer = viewer;
  next();
}

// GET /api/diagnostic/questions
// Devuelve las 9 preguntas sin la respuesta correcta
diagnostic.get(
  '/questions',
  asyncHandler(requireStudent),
  asyncHandler(async (_req, res) => {
    res.json(getPublicDiagnosticQuestions());
  })
);

interface AnswerInput {
  questionId: string;
  optionIndex: number;
}

// POST /api/diagnostic/submit
// Recibe las 9 respuestas, evalúa el nivel (TaRL) y guarda el resultado en el perfil
diagnostic.post(
  '/submit',
  asyncHandler(requireStudent),
  asyncHandler(async (req, res) => {
    const viewer = res.locals.viewer as { id: string };
    const { answers } = req.body as { answers?: unknown };

    if (!Array.isArray(answers) || answers.length !== DIAGNOSTIC_QUESTIONS.length) {
      return res.status(400).json({
        error: `Debes responder exactamente las ${DIAGNOSTIC_QUESTIONS.length} preguntas`,
      });
    }

    const questionMap = new Map(DIAGNOSTIC_QUESTIONS.map((q) => [q.id, q]));
    const answeredIds = new Set<string>();

    for (const item of answers) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: 'Formato de respuesta inválido' });
      }
      const { questionId, optionIndex } = item as Partial<AnswerInput>;
      if (typeof questionId !== 'string' || typeof optionIndex !== 'number') {
        return res.status(400).json({ error: 'Cada respuesta requiere questionId y optionIndex numérico' });
      }
      if (!questionMap.has(questionId)) {
        return res.status(400).json({ error: `Pregunta desconocida: ${questionId}` });
      }
      if (answeredIds.has(questionId)) {
        return res.status(400).json({ error: `Pregunta repetida: ${questionId}` });
      }
      if (optionIndex < 0 || optionIndex > 3 || !Number.isInteger(optionIndex)) {
        return res.status(400).json({ error: `Opción inválida para la pregunta: ${questionId}` });
      }
      answeredIds.add(questionId);
    }

    // Evaluación por niveles TaRL:
    // Empieza en EXPLORADOR_7_9. Sube a AVENTURERO_10_12 con 2 o más aciertos de 3 en ese nivel.
    // Sube a CREADOR_13_15 solo si ya subió y además tiene 2 o más de 3 en ese nivel.
    let correctExplorador = 0;
    let correctAventurero = 0;
    let correctCreador = 0;

    const answerMap = new Map((answers as AnswerInput[]).map((a) => [a.questionId, a.optionIndex]));

    for (const q of DIAGNOSTIC_QUESTIONS) {
      const selected = answerMap.get(q.id);
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) {
        if (q.tier === 'EXPLORADOR_7_9') correctExplorador++;
        else if (q.tier === 'AVENTURERO_10_12') correctAventurero++;
        else if (q.tier === 'CREADOR_13_15') correctCreador++;
      }
    }

    const totalCorrect = correctExplorador + correctAventurero + correctCreador;

    let determinedTier: AgeTier = 'EXPLORADOR_7_9';
    if (correctAventurero >= 2) {
      determinedTier = 'AVENTURERO_10_12';
      if (correctCreador >= 2) {
        determinedTier = 'CREADOR_13_15';
      }
    }

    const profile = await updateProfile(viewer.id, (p) => {
      p.diagnosticTier = determinedTier;
      p.diagnosedAt = new Date().toISOString();
    });
    if (!profile) {
      return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });
    }

    const result: DiagnosticResult = {
      diagnosticTier: determinedTier,
      correctCount: totalCorrect,
      total: DIAGNOSTIC_QUESTIONS.length,
    };

    res.json(result);
  })
);

