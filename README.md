# EduNova — Backend

API y contratos de datos de EduNova, plataforma de aprendizaje colaborativo, gamificado y adaptativo para niños y adolescentes de 7 a 15 años. Proyecto para Hack4Edu 2026 (ProFuturo).

- **Frontend (Next.js):** https://github.com/naohan/EduNova (carpeta `edunova-frontend/`)
- **Tablero de tareas:** https://github.com/users/nilton2005/projects/2

## Estructura
```
apps/api/                   API Node + Express + TypeScript
  src/routes/               Un archivo por dominio (ai, units, teacher, gamification, analytics, auth)
  src/services/gemini.ts    Llamadas a Gemini: ingesta del docente, "Explicar en casa" y preguntas del rival
  src/services/unitDraft.ts Valida lo que devuelve el modelo y arma el borrador de la unidad
  src/services/ai.ts        Respuestas simuladas: foto, hipótesis, duelo y respaldo si la IA falla
  src/services/bkt.ts       Dominio por criterio con Bayesian Knowledge Tracing
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
# GEMINI_API_KEY es opcional: sin ella, la ingesta y "Explicar en casa" usan el respaldo
npm install
npm run dev        # http://localhost:4000
npm run typecheck
npm run db:reset   # borra los datos de PostgreSQL y vuelve a la semilla
```

Las tablas se crean y se llenan con datos semilla al arrancar por primera vez. Las inserciones iniciales no sobrescriben el progreso existente. `db:reset` es destructivo: no lo ejecutes contra una base con datos que quieras conservar.

Prueba rápida: `curl localhost:4000/api/health`

## Endpoints
| Método | Ruta | Estado |
|---|---|---|
| POST | `/api/auth/login` | demo, usuarios de prueba |
| GET | `/api/units`, `/api/units/:id` | los borradores solo los ve un docente; al estudiante se le quita la rúbrica |
| POST | `/api/ai/ingest-document` | con token de docente: Gemini lee texto, PDF o imagen y deja un borrador; 60 llamadas por hora; respaldo con aviso si falla |
| PUT | `/api/teacher/approve-rubric` | con token: solo docente del aula |
| POST | `/api/ai/analyze-handwritten-photo` | simulado (hoja de prueba fija) |
| POST | `/api/ai/validate-duel-question` | simulado (heurística simple) |
| POST | `/api/ai/duel-opponent-questions` | con token de estudiante: Gemini genera preguntas del rival según curso y tema; respaldo si falla o no hay key |
| GET | `/api/diagnostic/questions` | con token de estudiante: 9 preguntas de nivel (TaRL) sin la respuesta |
| POST | `/api/diagnostic/submit` | con token de estudiante: evalúa nivel TaRL y guarda diagnosticTier y diagnosedAt en el perfil |
| POST | `/api/ai/family-home-explainer` | Gemini, solo recibe el tema; respaldo si falla |
| GET | `/api/leagues/leaderboard?league=mastery\|effort` | solo datos públicos de cada fila (Safe-Play) |
| GET | `/api/shop/items` | catálogo de accesorios |
| POST | `/api/shop/buy`, `/api/shop/equip` | con token de estudiante; el saldo se valida en el servidor |
| GET | `/api/benchmark/external/:studentId` | semilla |
| POST | `/api/labs/complete-mission` | persiste perfil; el dominio solo cambia con `firstTry: true` |
| POST | `/api/events` | con token de estudiante: guarda hasta 200 eventos de aprendizaje, sin duplicar por id, y actualiza el dominio con BKT |
| POST | `/api/progress/sync` | persiste progreso en PostgreSQL |
| GET | `/api/duel/ghost-opponent?ageTier=` | semilla, por rango de edad |
| POST | `/api/duel/result` | persiste XP y NovaCoins en PostgreSQL |
| GET | `/api/passport/:studentId` | JSON de competencias + QR en SVG |
| GET | `/api/analytics/explainable-alerts?classId=` | con token: solo docente del aula; calcula alertas por tema e inactividad con acciones sugeridas |
| GET | `/api/students/:id/profile` | con token: estudiante, su tutor o su docente |
| GET | `/api/classes/:code/students` | con token: solo docente del aula |
| GET | `/api/classes/:code/analytics` | con token: solo docente del aula |
| POST | `/api/ai/validate-hypothesis` | simulado (revisa que haya causa y efecto) |
| POST | `/api/assess/submit-reasoning` | con token del estudiante: guarda la nota de la IA y suma el bono |
| GET | `/api/classes/:code/assessments` | con token: solo docente del aula |
| PUT | `/api/teacher/assessments/:id/override` | con token: el docente reemplaza la nota de la IA |
| PUT | `/api/teacher/alerts/:id/attended` | con token: solo docente del aula; registra la alerta como atendida |
| GET | `/api/pictograms/:id` | proxy de pictogramas ARASAAC con caché pública (7 días) |

Los endpoints con token piden `Authorization: Bearer <token>`, con el `token` que devuelve `/api/auth/login`. Ejemplo de docente: `{"userId":"u-teacher-1"}`, aula `EDU-402`.

## Desplegar en Render
El archivo [render.yaml](render.yaml) define el servicio y una base PostgreSQL conectada. Hay dos formas de desplegar:

1. **Blueprint (recomendado):** en Render, ve a **New → Blueprint**, elige `nilton2005/edunova` y pulsa **Apply**. Se crean el servicio `edunova-api` y la base `edunova-db`; Render inyecta la URL interna como `DATABASE_URL`.
2. **Si ya creaste el Web Service manualmente:** crea también una base PostgreSQL en Render, preferiblemente en la misma región. En el Environment del backend configura `DATABASE_URL` con la **Internal Database URL** que muestra la base. Si usas la URL externa, configura también `DATABASE_SSL=true`.
3. En ambos casos, mantén `NODE_VERSION=22`. El backend crea las tablas y carga las semillas al iniciar.
4. Cuando termine el despliegue, abre `https://<tu-servicio>.onrender.com/api/health`. Debe responder `{"ok":true,...}`.
5. En el frontend, pon esa URL en `.env.local` (`NEXT_PUBLIC_API_URL=https://<tu-servicio>.onrender.com`) y reinicia `npm run dev`.
6. Si el frontend también se despliega, configura `WEB_ORIGIN` con su URL en Render (*Environment*).

7. Para usar la IA real, agrega `GEMINI_API_KEY` en el Environment del backend. Sin ella, la app funciona con el respaldo.

Cada commit a `main` redespliega solo.

**Límites del plan gratis, importantes para el demo:**
- El servicio web Free **se duerme tras 15 minutos sin uso**; la base de datos PostgreSQL es un servicio separado y conserva los datos aunque la API se duerma.
- La base PostgreSQL Free de Render **vence 30 días después de crearla**, aunque tenga actividad. Para conservar datos por más tiempo, actualízala a un plan de pago antes de que venza y sigue las instrucciones de Render.
- La API es pública: cualquiera con la URL puede llamarla. Los datos son de prueba y el token de demo no está firmado.

## Cómo trabajar
- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Se sube directo a `main`, sin PRs. Antes de subir, `git pull`.
- Los tipos viven en `packages/shared-types/edunova-contract.ts`. El frontend copia ese archivo; si cambia, avisa.
