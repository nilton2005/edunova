import { Router } from 'express';
import { getProfile, saveProfile } from '../data/db.js';

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
duel.post('/result', (req, res) => {
  const { studentId, won = false, questionsCreated = 0 } = req.body ?? {};
  const profile = studentId ? getProfile(studentId) : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  const xp = (won ? 100 : 40) + Number(questionsCreated) * 10;
  const coins = won ? 30 : 10;
  profile.leagues.masteryPoints += xp;
  profile.novaCoins += coins;
  saveProfile(profile);
  res.json({ xp, coins, profile });
});
