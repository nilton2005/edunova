import { Router } from 'express';
import type { LabMissionComplete } from '../../../../packages/shared-types/edunova-contract';
import { getProfile, listProfiles, saveProfile } from '../data/db.js';
import { aliasByStudent, benchmarkFor } from '../data/seed.js';

export const gamification = Router();

// GET /api/leagues/leaderboard?league=mastery|effort
gamification.get('/leagues/leaderboard', (req, res) => {
  const key = req.query.league === 'effort' ? 'effortPoints' : 'masteryPoints';
  const sorted = listProfiles()
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
  const profile = studentId ? getProfile(studentId) : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  profile.leagues.masteryPoints += rewardXP;
  profile.novaCoins += rewardCoins;
  saveProfile(profile);
  res.json(profile);
});

// POST /api/progress/sync  body: { studentId, events: [{ xp?, coins? }] }
gamification.post('/progress/sync', (req, res) => {
  const { studentId, events = [] } = req.body ?? {};
  const profile = studentId ? getProfile(studentId) : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  for (const e of events) {
    profile.leagues.effortPoints += e.xp ?? 0;
    profile.novaCoins += e.coins ?? 0;
  }
  saveProfile(profile);
  res.json({ synced: events.length });
});
