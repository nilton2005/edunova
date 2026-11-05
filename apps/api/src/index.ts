import cors from 'cors';
import express from 'express';
import { ai } from './routes/ai.js';
import { analytics } from './routes/analytics.js';
import { auth } from './routes/auth.js';
import { gamification } from './routes/gamification.js';
import { teacher } from './routes/teacher.js';
import { unitsRouter } from './routes/units.js';

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'edunova-api' }));
app.use('/api/auth', auth);
app.use('/api/units', unitsRouter);
app.use('/api/teacher', teacher);
app.use('/api/ai', ai);
app.use('/api/analytics', analytics);
app.use('/api', gamification);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`EduNova API en http://localhost:${port}`));
