import { Router } from 'express';
import type { LabMissionComplete } from '../../../../packages/shared-types/edunova-contract';
import { getProfile, listProfiles, saveProfile } from '../data/db.js';
import { aliasByStudent, benchmarkFor } from '../data/seed.js';
import { asyncHandler } from '../services/async-handler.js';
import { recordMissionMastery } from '../services/analytics.js';

export const gamification = Router();

// GET /api/leagues/leaderboard?league=mastery|effort
gamification.get('/leagues/leaderboard', asyncHandler(async (req, res) => {
  const key = req.query.league === 'effort' ? 'effortPoints' : 'masteryPoints';
  const sorted = (await listProfiles())
    .sort((a, b) => b.leagues[key] - a.leagues[key])
    .map((p) => ({ ...p, alias: aliasByStudent[p.studentId] }));
  res.json(sorted);
}));

// GET /api/benchmark/external/:studentId
gamification.get('/benchmark/external/:studentId', (req, res) => {
  res.json(benchmarkFor(req.params.studentId));
});

// POST /api/labs/complete-mission  body: LabMissionComplete & { studentId }
gamification.post('/labs/complete-mission', asyncHandler(async (req, res) => {
  const { studentId, subtopicId, rewardXP = 0, rewardCoins = 0 } = (req.body ?? {}) as Partial<LabMissionComplete> & { studentId?: string };
  const profile = studentId ? await getProfile(studentId) : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  profile.leagues.masteryPoints += rewardXP;
  profile.novaCoins += rewardCoins;
  await saveProfile(profile);
  if (subtopicId) await recordMissionMastery(profile.studentId, subtopicId);
  res.json(profile);
}));

// POST /api/progress/sync  body: { studentId, events: [{ xp?, coins? }] }
gamification.post('/progress/sync', asyncHandler(async (req, res) => {
  const { studentId, events = [] } = req.body ?? {};
  const profile = studentId ? await getProfile(studentId) : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  for (const e of events) {
    profile.leagues.effortPoints += e.xp ?? 0;
    profile.novaCoins += e.coins ?? 0;
  }
  await saveProfile(profile);
  res.json({ synced: events.length });
}));
