# EduNova — Monorepo (Hack4Edu 2026)

Plataforma de Aprendizaje Colaborativo, Gamificado y Adaptativo para niños y adolescentes de 7 a 15 años. Proyecto para Hack4Edu 2026 (ProFuturo).

- **Tablero de tareas:** https://github.com/users/nilton2005/projects/2
- **Documentación de arquitectura:** [Plan Maestro de Arquitectura y Producto](docs/ALCANCE.md)

---

## 📁 Estructura del Monorepo

```
├── apps/
│   ├── api/                    # API Backend (Node + Express + TypeScript, puerto 4000)
│   │   ├── src/routes/         # Rutas por dominio (auth, units, teacher, ai, duel, passport, gamification, analytics)
│   │   ├── src/services/ai.ts  # IA simulada sin API key (simulate con latencia)
│   │   └── src/data/seed.ts    # Datos semilla en memoria (5 usuarios, 2 unidades)
│   └── web/                    # Frontend (Next.js 16 + React 19 + Tailwind CSS v4, puerto 3000)
│       ├── app/                # App Router (rutas /estudiante, /docente, /)
│       ├── components/         # Componentes UI, visores 3D (Solar, Cuerpo) y gráficos
│       └── public/assets/      # Modelos 3D (.glb), sprites y assets
├── packages/
│   └── shared-types/           # Contratos TypeScript unificados (@edunova/shared-types)
├── docs/                       # Alcance, historias de usuario y prompts pedagógicos
├── .env.example                # Variables de entorno unificadas del monorepo
├── package.json                # Configuración raíz con npm workspaces
└── CLAUDE.md                   # Reglas para agentes de IA y desarrolladores
```

---

## 🚀 Inicio Rápido

### 1. Clonar e instalar dependencias

```bash
# Desde la raíz del monorepo:
cp .env.example .env
npm install
```

### 2. Arrancar en desarrollo

```bash
# Arranca tanto el Backend (4000) como el Frontend (3000) en paralelo:
npm run dev
```

O arrancar individualmente:

```bash
npm run dev:api     # Solo API (http://localhost:4000)
npm run dev:web     # Solo Web (http://localhost:3000)
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 🛠️ Scripts y Tooling

| Comando | Descripción |
|---|---|
| `npm run dev` | Arranca API y Frontend simultáneamente con `concurrently` |
| `npm run dev:api` | Arranca únicamente el backend Express en modo watch |
| `npm run dev:web` | Arranca únicamente el frontend Next.js |
| `npm run typecheck` | Verificación de tipos TypeScript en todos los workspaces |
| `npm run lint` | Análisis estático de código en todos los workspaces |
| `npm run build` | Compilación de producción de todos los paquetes |

---

## 📡 Endpoints del API Backend

| Método | Ruta | Descripción / Estado |
|---|---|---|
| `GET` | `/api/health` | Healthcheck del servicio |
| `POST` | `/api/auth/login` | Login demo con 5 usuarios semilla |
| `GET` | `/api/units` | Listado de unidades curriculares |
| `GET` | `/api/units/:id?ageTier=` | Unidad adaptada según rango de edad |
| `POST` | `/api/ai/ingest-document` | Extracción de subtemas y rúbrica editable |
| `PUT` | `/api/teacher/approve-rubric` | Aprobación docente (DRAFT → PUBLISHED) |
| `POST` | `/api/ai/analyze-handwritten-photo` | Análisis paso a paso de foto de cuaderno |
| `POST` | `/api/ai/validate-duel-question` | Validación de preguntas de duelo |
| `POST` | `/api/ai/family-home-explainer` | Explicación cotidiana para padres/tutores |
| `GET` | `/api/leagues/leaderboard?league=` | Tablas de posiciones (Maestría / Superación) |
| `GET` | `/api/benchmark/external/:studentId` | Benchmarking y percentil comparativo |
| `POST` | `/api/labs/complete-mission` | Registro de recompensas de misión 3D |
| `POST` | `/api/progress/sync` | Sincronización offline-first de progreso |
| `GET` | `/api/duel/ghost-opponent?ageTier=` | Oponente fantasma para duelo asíncrono |
| `POST` | `/api/duel/result` | Registro de resultado de duelo (+XP, NovaCoins) |
| `GET` | `/api/passport/:studentId` | Pasaporte con competencias y código QR en SVG |
| `GET` | `/api/analytics/explainable-alerts` | Alertas pedagógicas explicables |

---

## 👥 Usuarios de Prueba (Seed)

| Usuario ID | Rol | Alias | Detalle |
|---|---|---|---|
| `u-teacher-1` | `TEACHER` | Profe Ana | Docente del aula `EDU-402` |
| `u-student-1` | `STUDENT` | Gloria | Aventurera (10-12 años), aula `EDU-402` |
| `u-student-2` | `STUDENT` | Mateo | Explorador (7-9 años), aula `EDU-402` |
| `u-student-3` | `STUDENT` | Sofía | Creadora (13-15 años), aula `EDU-402` |
| `u-family-1` | `FAMILY_TUTOR` | Mamá de Gloria | Tutor familiar vinculado |

---

## 📋 Reglas de Desarrollo

- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Los contratos compartidos viven en `packages/shared-types` y se importan como `@edunova/shared-types`.
- Trabaja en tu propia rama (`Bryan` o `feat/<modulo>-<tarea>`) y crea PR hacia `main`.
