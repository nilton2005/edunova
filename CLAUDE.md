# EduNova — reglas para agentes de IA (Claude Code / Cursor)

Hackathon Hack4Edu 2026. Entrega en **48 horas**. Prioridad: que el demo de 3 minutos funcione sin fallos.

Este repo es el **backend** (Node + Express + TypeScript) y el contrato de datos. El frontend vive en https://github.com/naohan/EduNova (`edunova-frontend/`, Next.js 16 + React 19 + Tailwind 4). Sus rutas están en español (`/estudiante`, `/docente`); el backend se adapta a ellas.

## Reglas obligatorias
1. **Tipos:** importa SIEMPRE de `packages/shared-types/edunova-contract.ts`. No dupliques ni redefinas tipos. Si falta algo, pide cambio al líder.
2. **Rutas del API:** una por archivo de dominio en `apps/api/src/routes/`. No metas todo en `index.ts`.
3. **Ramas:** `feat/<modulo>-<tarea>`. PR pequeños a `main`. Nunca push directo a `main`.
4. **IA con respaldo (RNF-03):** todo endpoint de IA usa `withFallback` de `services/ai.ts`. Si el LLM tarda más de 4 s o falla, responde con datos pre-guardados y `usedFallback: true`.
5. **Datos simulados:** ligas, percentiles, Copa, Fantasma y Pasaporte QR usan datos semilla. Deben verse reales.
6. **Safe-Play:** solo alias, avatar, rango de edad e institución. Nunca apellidos, teléfonos ni geolocalización.
7. **Sin secretos en el repo:** las claves van en `.env` (ignorado por git). Repo público.
8. **Rúbrica oculta:** el estudiante ve misiones lúdicas, nunca la tabla de rúbrica.
9. **Aprobación docente:** la IA nunca publica una unidad sin el clic de "Aprobar y Publicar" (DRAFT → PUBLISHED).
10. **Cambios de contrato:** si cambias un tipo o un endpoint, avisa a quien hace el frontend.

## Alcance (ver docs/ALCANCE.md)
- P1 = demo. P2 = si hay tiempo. P3 = solo mencionado en el pitch.
- Congelamiento de funciones: últimas 6 horas, solo ensayo y arreglo de bugs.

## Idioma
Código en inglés, textos de interfaz y comentarios en español.
