import { Router } from 'express';
import { updateProfile } from '../data/db.js';
import { asyncHandler } from '../services/async-handler.js';

export const duel = Router();

// Banco de "fantasmas": partidas grabadas de estudiantes de otras instituciones (simulado, #20).
const ghosts = [
  { alias: 'Valentina', institutionName: 'I.E. Los Andes', ageRange: '10-12', timeSeconds: 94, score: 8 },
  { alias: 'Lucas', institutionName: 'Colegio San Martín', ageRange: '10-12', timeSeconds: 110, score: 7 },
  { alias: 'Camila', institutionName: 'Escuela Rural Esperanza', ageRange: '7-9', timeSeconds: 130, score: 6 },
  { alias: 'Diego', institutionName: 'I.E. Los Andes', ageRange: '13-15', timeSeconds: 80, score: 9 },
];

const AGE_RANGE = { EXPLORADOR_7_9: '7-9', AVENTURERO_10_12: '10-12', CREADOR_13_15: '13-15' } as const;

// GET /api/duel/ghost-opponent?ageTier=AVENTURERO_10_12
duel.get('/ghost-opponent', (req, res) => {
  const range = AGE_RANGE[req.query.ageTier as keyof typeof AGE_RANGE];
  const pool = ghosts.filter((g) => !range || g.ageRange === range);
  res.json(pool[Math.floor(Math.random() * pool.length)] ?? ghosts[0]);
});

// POST /api/duel/result  body: { studentId, won, timeSeconds, questionsCreated }
// Premia a la Liga de Maestría (calidad de preguntas) y suma NovaCoins.
duel.post('/result', asyncHandler(async (req, res) => {
  const { studentId, won = false, questionsCreated = 0 } = req.body ?? {};
  const xp = (won ? 100 : 40) + Number(questionsCreated) * 10;
  const coins = won ? 30 : 10;
  const profile = studentId
    ? await updateProfile(studentId, (p) => {
        p.leagues.masteryPoints += xp;
        p.novaCoins += coins;
      })
    : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  res.json({ xp, coins, profile });
}));
