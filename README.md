# EduNova — Backend

API y contratos de datos de EduNova, plataforma de aprendizaje colaborativo, gamificado y adaptativo para niños y adolescentes de 7 a 15 años. Proyecto para Hack4Edu 2026 (ProFuturo).

- **Frontend (Next.js):** https://github.com/naohan/EduNova (carpeta `edunova-frontend/`)
- **Tablero de tareas:** https://github.com/users/nilton2005/projects/2

## Estructura
```
apps/api/                   API Node + Express + TypeScript
  src/routes/               Un archivo por dominio (ai, units, teacher, gamification, analytics, auth)
  src/services/ai.ts        IA simulada (sin API key): respuestas fijas con latencia falsa
  src/data/seed.ts          Datos semilla (se cargan a la DB la primera vez)
  src/data/db.ts            SQLite (better-sqlite3): usuarios, unidades y perfiles persisten
packages/shared-types/      Contrato de datos compartido con el frontend
docs/                       Alcance y prompts pedagógicos
```

## Arrancar
```bash
cd apps/api
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
npm run typecheck
npm run db:reset   # borra apps/api/data/ y vuelve a la semilla (parar el servidor antes)
```

La base de datos es el archivo `apps/api/data/edunova.db` (ignorado por git). Se crea y se llena sola al arrancar.

Prueba rápida: `curl localhost:4000/api/health`

## Endpoints (todos responden con datos semilla; la IA es simulada, sin API key)
| Método | Ruta | Estado |
|---|---|---|
| POST | `/api/auth/login` | demo, 5 usuarios de prueba |
| GET | `/api/units`, `/api/units/:id` | semilla (Sistema Solar, Fracciones) |
| POST | `/api/ai/ingest-document` | simulado (elige unidad por palabras clave) |
| PUT | `/api/teacher/approve-rubric` | listo |
| POST | `/api/ai/analyze-handwritten-photo` | simulado (hoja de prueba fija) |
| POST | `/api/ai/validate-duel-question` | simulado (heurística simple) |
| POST | `/api/ai/family-home-explainer` | simulado |
| GET | `/api/leagues/leaderboard?league=mastery\|effort` | semilla |
| GET | `/api/benchmark/external/:studentId` | semilla |
| POST | `/api/labs/complete-mission` | en memoria |
| POST | `/api/progress/sync` | en memoria |
| GET | `/api/duel/ghost-opponent?ageTier=` | semilla, por rango de edad |
| POST | `/api/duel/result` | en memoria, suma XP y NovaCoins |
| GET | `/api/passport/:studentId` | JSON de competencias + QR en SVG |
| GET | `/api/analytics/explainable-alerts` | semilla |

## Cómo trabajar
- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Una rama por tarea: `feat/<modulo>-<tarea>`, PR a `main`.
- Los tipos viven en `packages/shared-types/edunova-contract.ts`. El frontend copia ese archivo; si cambia, avisa.
