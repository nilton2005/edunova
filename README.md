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
  src/data/db.ts            PostgreSQL: usuarios, unidades, perfiles y dominio por criterio
packages/shared-types/      Contrato de datos compartido con el frontend
docs/                       Alcance y prompts pedagógicos
```

## Arrancar
```bash
cd apps/api
cp .env.example .env
# Configura DATABASE_URL con tu PostgreSQL local antes de arrancar
npm install
npm run dev        # http://localhost:4000
npm run typecheck
npm run db:reset   # borra los datos de PostgreSQL y vuelve a la semilla
```

Las tablas se crean y se llenan con datos semilla al arrancar por primera vez. Las inserciones iniciales no sobrescriben el progreso existente. `db:reset` es destructivo: no lo ejecutes contra una base con datos que quieras conservar.

Prueba rápida: `curl localhost:4000/api/health`

## Endpoints (todos responden con datos semilla; la IA es simulada, sin API key)
| Método | Ruta | Estado |
|---|---|---|
| POST | `/api/auth/login` | demo, usuarios de prueba |
| GET | `/api/units`, `/api/units/:id` | semilla (Sistema Solar, Fracciones) |
| POST | `/api/ai/ingest-document` | simulado (elige unidad por palabras clave) |
| PUT | `/api/teacher/approve-rubric` | listo |
| POST | `/api/ai/analyze-handwritten-photo` | simulado (hoja de prueba fija) |
| POST | `/api/ai/validate-duel-question` | simulado (heurística simple) |
| POST | `/api/ai/family-home-explainer` | simulado |
| GET | `/api/leagues/leaderboard?league=mastery\|effort` | semilla |
| GET | `/api/benchmark/external/:studentId` | semilla |
| POST | `/api/labs/complete-mission` | persiste perfil y dominio en PostgreSQL |
| POST | `/api/progress/sync` | persiste progreso en PostgreSQL |
| GET | `/api/duel/ghost-opponent?ageTier=` | semilla, por rango de edad |
| POST | `/api/duel/result` | persiste XP y NovaCoins en PostgreSQL |
| GET | `/api/passport/:studentId` | JSON de competencias + QR en SVG |
| GET | `/api/analytics/explainable-alerts` | calculado con el dominio del aula |
| GET | `/api/students/:id/profile` | con token: estudiante, su tutor o su docente |
| GET | `/api/classes/:code/students` | con token: solo docente del aula |
| GET | `/api/classes/:code/analytics` | con token: solo docente del aula |

Los endpoints con token piden `Authorization: Bearer <token>`, con el `token` que devuelve `/api/auth/login`. Ejemplo de docente: `{"userId":"u-teacher-1"}`, aula `EDU-402`.

## Desplegar en Render
El archivo [render.yaml](render.yaml) define el servicio y una base PostgreSQL conectada. Hay dos formas de desplegar:

1. **Blueprint (recomendado):** en Render, ve a **New → Blueprint**, elige `nilton2005/edunova` y pulsa **Apply**. Se crean el servicio `edunova-api` y la base `edunova-db`; Render inyecta la URL interna como `DATABASE_URL`.
2. **Si ya creaste el Web Service manualmente:** crea también una base PostgreSQL en Render, preferiblemente en la misma región. En el Environment del backend configura `DATABASE_URL` con la **Internal Database URL** que muestra la base. Si usas la URL externa, configura también `DATABASE_SSL=true`.
3. En ambos casos, mantén `NODE_VERSION=22`. El backend crea las tablas y carga las semillas al iniciar.
4. Cuando termine el despliegue, abre `https://<tu-servicio>.onrender.com/api/health`. Debe responder `{"ok":true,...}`.
5. En el frontend, pon esa URL en `.env.local` (`NEXT_PUBLIC_API_URL=https://<tu-servicio>.onrender.com`) y reinicia `npm run dev`.
6. Si el frontend también se despliega, configura `WEB_ORIGIN` con su URL en Render (*Environment*).

Cada commit a `main` redespliega solo.

**Límites del plan gratis, importantes para el demo:**
- El servicio web Free **se duerme tras 15 minutos sin uso**; la base de datos PostgreSQL es un servicio separado y conserva los datos aunque la API se duerma.
- La base PostgreSQL Free de Render **vence 30 días después de crearla**, aunque tenga actividad. Para conservar datos por más tiempo, actualízala a un plan de pago antes de que venza y sigue las instrucciones de Render.
- La API es pública: cualquiera con la URL puede llamarla. Los datos son de prueba y el token de demo no está firmado.

## Cómo trabajar
- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Se sube directo a `main`, sin PRs. Antes de subir, `git pull`.
- Los tipos viven en `packages/shared-types/edunova-contract.ts`. El frontend copia ese archivo; si cambia, avisa.
