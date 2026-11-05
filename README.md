# EduNova — Backend

API y contratos de datos de EduNova, plataforma de aprendizaje colaborativo, gamificado y adaptativo para niños y adolescentes de 7 a 15 años. Proyecto para Hack4Edu 2026 (ProFuturo).

- **Frontend (Next.js):** https://github.com/naohan/EduNova (carpeta `edunova-frontend/`)
- **Tablero de tareas:** https://github.com/users/nilton2005/projects/2

## Estructura
```
apps/api/                   API Node + Express + TypeScript
  src/routes/               Un archivo por dominio (ai, units, teacher, gamification, analytics, auth)
  src/services/ai.ts        Respaldo determinista de IA (RNF-03)
  src/data/seed.ts          Datos semilla en memoria
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
```

Prueba rápida: `curl localhost:4000/api/health`

## Endpoints (todos responden hoy con datos semilla o respaldo)
| Método | Ruta | Estado |
|---|---|---|
| POST | `/api/auth/login` | demo, 5 usuarios de prueba |
| GET | `/api/units`, `/api/units/:id` | semilla (Sistema Solar, Fracciones) |
| POST | `/api/ai/ingest-document` | respaldo; falta PDF + LLM (#4) |
| PUT | `/api/teacher/approve-rubric` | listo |
| POST | `/api/ai/analyze-handwritten-photo` | respaldo; falta multimodal (#12) |
| POST | `/api/ai/validate-duel-question` | heurística simple |
| POST | `/api/ai/family-home-explainer` | respaldo |
| GET | `/api/leagues/leaderboard?league=mastery\|effort` | semilla |
| GET | `/api/benchmark/external/:studentId` | semilla |
| POST | `/api/labs/complete-mission` | en memoria |
| POST | `/api/progress/sync` | en memoria |
| GET | `/api/duel/ghost-opponent` | semilla |
| GET | `/api/analytics/explainable-alerts` | semilla |

## Cómo trabajar
- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Una rama por tarea: `feat/<modulo>-<tarea>`, PR a `main`.
- Los tipos viven en `packages/shared-types/edunova-contract.ts`. El frontend copia ese archivo; si cambia, avisa.
