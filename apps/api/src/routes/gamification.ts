import { Router } from 'express';
import type { LabMissionComplete } from '@edunova/shared-types';
import { aliasByStudent, benchmarkFor, profiles } from '../data/seed.js';

export const gamification = Router();

// GET /api/leagues/leaderboard?league=mastery|effort
gamification.get('/leagues/leaderboard', (req, res) => {
  const key = req.query.league === 'effort' ? 'effortPoints' : 'masteryPoints';
  const sorted = [...profiles]
    .sort((a, b) => b.leagues[key] - a.leagues[key])
    .map((p) => ({ ...p, alias: aliasByStudent[p.studentId] }));
  res.json(sorted);
});

// GET /api/benchmark/external/:studentId
gamification.get('/benchmark/external/:studentId', (req, res) => {
  res.json(benchmarkFor(req.params.studentId));
});

// POST /api/labs/complete-mission  body: LabMissionComplete & { studentId }
gamification.post('/labs/complete-mission', (req, res) => {
  const { studentId, rewardXP = 0, rewardCoins = 0 } = (req.body ?? {}) as Partial<LabMissionComplete> & { studentId?: string };
  const profile = profiles.find((p) => p.studentId === studentId);
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  profile.leagues.masteryPoints += rewardXP;
  profile.novaCoins += rewardCoins;
  res.json(profile);
});

// POST /api/progress/sync  body: { studentId, events: [{ xp?, coins? }] }
gamification.post('/progress/sync', (req, res) => {
  const { studentId, events = [] } = req.body ?? {};
  const profile = profiles.find((p) => p.studentId === studentId);
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  for (const e of events) {
    profile.leagues.effortPoints += e.xp ?? 0;
    profile.novaCoins += e.coins ?? 0;
  }
  res.json({ synced: events.length });
});
