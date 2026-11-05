# EduNova

Plataforma de aprendizaje colaborativo, gamificado y adaptativo para niños y adolescentes de 7 a 15 años. Proyecto para Hack4Edu 2026 (ProFuturo).

## Estructura
```
apps/api/                       Backend
apps/web/                       Frontend (PWA)
packages/shared-types/          Contratos de datos compartidos
features/teacher-studio/        Ingesta IA y rúbricas
features/student-journey/       Camaleón UI y ruta del estudiante
features/labs-3d/               Laboratorios 3D
features/games-hub/             Juegos y duelos
features/assessment-vision/     Foto del cuaderno y evaluación
features/gamification-family/   Ligas, tienda, tutor familiar
features/offline-analytics/     PWA offline y alertas del docente
docs/                           Alcance y prompts pedagógicos
```

## Cómo trabajar
- Lee [CLAUDE.md](CLAUDE.md) y [docs/ALCANCE.md](docs/ALCANCE.md).
- Una rama por tarea: `feat/<modulo>-<tarea>`, PR a `main`.
- Los tipos viven en `packages/shared-types/edunova-contract.ts`.
