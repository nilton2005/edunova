# EduNova — reglas para agentes de IA (Claude Code / Cursor / Gemini)

Hackathon Hack4Edu 2026. Entrega en **48 horas**. Prioridad: que el demo de 3 minutos funcione sin fallos.

Este repositorio es el **monorepo completo** de EduNova con:
- `apps/api`: Backend en Node + Express + TypeScript (puerto 4000).
- `apps/web`: Frontend en Next.js 16 + React 19 + Tailwind CSS v4 (puerto 3000).
- `packages/shared-types`: Contrato de datos compartido unificado (`@edunova/shared-types`).

## Reglas obligatorias
1. **Tipos:** importa SIEMPRE de `@edunova/shared-types` (o `packages/shared-types/edunova-contract.ts`). No dupliques ni redefinas tipos. Si falta algo, pide cambio al líder.
2. **Rutas del API:** una por archivo de dominio en `apps/api/src/routes/`. No metas todo en `index.ts`.
3. **Ramas:** `feat/<modulo>-<tarea>` o rama asignada. PR pequeños a `main`. Nunca push directo a `main`.
4. **IA simulada, sin API key (decisión del equipo):** no se usa ningún LLM ni se piden claves. Todo endpoint de IA usa `simulate` de `services/ai.ts`: respuesta determinista con latencia falsa de ~1 s. `usedFallback` queda siempre en `true`. No agregues dependencias de proveedores de IA.
5. **Datos simulados:** ligas, percentiles, Copa, Fantasma y Pasaporte QR usan datos semilla. Deben verse reales.
6. **Safe-Play:** solo alias, avatar, rango de edad e institución. Nunca apellidos, teléfonos ni geolocalización.
7. **Sin secretos en el repo:** las variables van en `.env` (ignorado por git). Ver `.env.example` en la raíz. Repo público.
8. **Rúbrica oculta:** el estudiante ve misiones lúdicas, nunca la tabla de rúbrica.
9. **Aprobación docente:** la IA nunca publica una unidad sin el clic de "Aprobar y Publicar" (DRAFT → PUBLISHED).
10. **Tooling y scripts:**
    - `npm run dev`: arranca API (4000) y Web (3000) simultáneamente.
    - `npm run dev:api`: arranca solo la API.
    - `npm run dev:web`: arranca solo la Web.
    - `npm run typecheck`: ejecuta verificación de TypeScript en todos los workspaces.
    - `npm run lint`: ejecuta ESLint / typecheck en todos los workspaces.
    - `npm run build`: compila todos los workspaces.

## Alcance (ver docs/ALCANCE.md)
- P1 = demo. P2 = si hay tiempo. P3 = solo mencionado en el pitch.
- Congelamiento de funciones: últimas 6 horas, solo ensayo y arreglo de bugs.

## Idioma
Código en inglés, textos de interfaz y comentarios en español.
