import { Router } from 'express';
import type {
  LabMissionComplete,
  LeaderboardAroundMeResponse,
  LeaderboardEntry,
} from '../../../../packages/shared-types/edunova-contract';
import { listProfiles, listUsers, updateProfile } from '../data/db.js';
import { aliasByStudent, benchmarkFor } from '../data/seed.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';
import { recordObservation } from '../services/analytics.js';

export const gamification = Router();

// GET /api/leagues/leaderboard?league=mastery|effort&around=me
gamification.get('/leagues/leaderboard', asyncHandler(async (req, res) => {
  const key = req.query.league === 'effort' ? 'effortPoints' : 'masteryPoints';

  if (req.query.around === 'me') {
    const viewer = await currentUser(req);
    if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
    if (viewer.role !== 'STUDENT') return res.status(403).json({ error: 'Solo los estudiantes ven su entorno de liga' });

    // Calcula el ranking de su mismo classroomCode
    const classUsers = (await listUsers()).filter(
      (u) => u.role === 'STUDENT' && (viewer.classroomCode ? u.classroomCode === viewer.classroomCode : true),
    );
    const classStudentIds = new Set(classUsers.map((u) => u.id));
    classStudentIds.add(viewer.id);

    const allProfiles = await listProfiles();
    const classProfiles = allProfiles.filter((p) => classStudentIds.has(p.studentId));

    classProfiles.sort((a, b) => b.leagues[key] - a.leagues[key]);

    const classRows: LeaderboardEntry[] = classProfiles.map((p) => ({
      studentId: p.studentId,
      alias: aliasByStudent[p.studentId] ?? p.alias ?? 'Estudiante',
      institutionName: p.institutionName,
      masteryPoints: p.leagues.masteryPoints,
      effortPoints: p.leagues.effortPoints,
      division: p.leagues.division,
    }));

    const total = classRows.length;
    const viewerIndex = classRows.findIndex((r) => r.studentId === viewer.id);
    const myPosition = viewerIndex >= 0 ? viewerIndex + 1 : 1;

    // Devuelve hasta 2 filas arriba, la suya y hasta 2 abajo.
    const start = Math.max(0, (viewerIndex >= 0 ? viewerIndex : 0) - 2);
    const end = Math.min(total, (viewerIndex >= 0 ? viewerIndex : 0) + 3);
    const slicedRows = classRows.slice(start, end);

    const response: LeaderboardAroundMeResponse = {
      rows: slicedRows,
      myPosition,
      total,
    };
    return res.json(response);
  }

  const rows: LeaderboardEntry[] = (await listProfiles())
    .sort((a, b) => b.leagues[key] - a.leagues[key])
    .map((p) => ({
      studentId: p.studentId,
      alias: aliasByStudent[p.studentId],
      institutionName: p.institutionName,
      masteryPoints: p.leagues.masteryPoints,
      effortPoints: p.leagues.effortPoints,
      division: p.leagues.division,
    }));
  res.json(rows);
}));

// GET /api/benchmark/external/:studentId
gamification.get('/benchmark/external/:studentId', (req, res) => {
  res.json(benchmarkFor(req.params.studentId));
});

// POST /api/labs/complete-mission  body: LabMissionComplete & { studentId }
gamification.post('/labs/complete-mission', asyncHandler(async (req, res) => {
  const { studentId, subtopicId, rewardXP = 0, rewardCoins = 0, firstTry = true } = (req.body ?? {}) as Partial<LabMissionComplete> & {
    studentId?: string;
    firstTry?: boolean;
  };
  const profile = studentId
    ? await updateProfile(studentId, (p) => {
        p.leagues.masteryPoints += rewardXP;
        p.novaCoins += rewardCoins;
      })
    : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  // Si erró antes de acertar, ese error ya llegó como evento: el acierto no prueba dominio.
  if (firstTry) {
    await recordObservation(profile.studentId, { activity: 'LAB_3D', correct: true, subtopicId, attempt: 1, hintsUsed: 0 });
  }
  res.json(profile);
}));

// POST /api/progress/sync  body: { studentId, events: [{ xp?, coins? }] }
gamification.post('/progress/sync', asyncHandler(async (req, res) => {
  const { studentId, events = [] } = req.body ?? {};
  const profile = studentId
    ? await updateProfile(studentId, (p) => {
        for (const e of events) {
          p.leagues.effortPoints += e.xp ?? 0;
          p.novaCoins += e.coins ?? 0;
        }
      })
    : undefined;
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });
  res.json({ synced: events.length });
}));
