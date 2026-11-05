import cors from 'cors';
import express from 'express';
import { ai } from './routes/ai.js';
import { analytics } from './routes/analytics.js';
import { auth } from './routes/auth.js';
import { classes } from './routes/classes.js';
import { duel } from './routes/duel.js';
import { gamification } from './routes/gamification.js';
import { passport } from './routes/passport.js';
import { students } from './routes/students.js';
import { teacher } from './routes/teacher.js';
import { unitsRouter } from './routes/units.js';

const app = express();
// WEB_ORIGIN admite varios orígenes separados por coma (el front local y el desplegado).
const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'edunova-api' }));
app.use('/api/auth', auth);
app.use('/api/units', unitsRouter);
app.use('/api/teacher', teacher);
app.use('/api/ai', ai);
app.use('/api/analytics', analytics);
app.use('/api/students', students);
app.use('/api/classes', classes);
app.use('/api/duel', duel);
app.use('/api/passport', passport);
app.use('/api', gamification);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`EduNova API en http://localhost:${port}`));
