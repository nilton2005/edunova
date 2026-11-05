import { Router } from 'express';
import QRCode from 'qrcode';
import { aliasByStudent, profiles } from '../data/seed.js';

export const passport = Router();

// GET /api/passport/:studentId
// Pasaporte EduNova: JSON resumido de competencias + QR (SVG) para llevar a otro colegio.
passport.get('/:studentId', async (req, res) => {
  const profile = profiles.find((p) => p.studentId === req.params.studentId);
  if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const summary = {
    v: 1,
    alias: aliasByStudent[profile.studentId],
    division: profile.leagues.division,
    masteryPoints: profile.leagues.masteryPoints,
    badges: profile.badges,
    competencies: [
      { unit: 'Sistema Solar', level: 'LOGRADO' },
      { unit: 'Mundo de las Fracciones', level: 'EN_PROGRESO' },
    ],
    issuedAt: new Date().toISOString(),
  };
  const payload = JSON.stringify(summary);
  const qrSvg = await QRCode.toString(payload, { type: 'svg', margin: 1 });
  res.json({ ...summary, payload, qrSvg });
});
