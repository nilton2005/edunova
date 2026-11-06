# EduNova — reglas para agentes de IA (Claude Code / Cursor)

Hackathon Hack4Edu 2026. Entrega en **48 horas**. Prioridad: que el demo de 3 minutos funcione sin fallos.

Este repo es el **backend** (Node + Express + TypeScript) y el contrato de datos. El frontend vive en https://github.com/naohan/EduNova (`edunova-frontend/`, Next.js 16 + React 19 + Tailwind 4). 

**El Plan Maestro es la fuente de verdad del backend.** Los datos y endpoints siguen el plan (por ejemplo, % de dominio por criterio de rúbrica), no los datos fijos de los `data.ts` del frontend. Si no coinciden, se adapta el frontend.

## Reglas obligatorias
1. **Tipos:** importa SIEMPRE de `packages/shared-types/edunova-contract.ts`. No dupliques ni redefinas tipos. Si falta algo, pide cambio al líder.
2. **Rutas del API:** una por archivo de dominio en `apps/api/src/routes/`. No metas todo en `index.ts`.
3. **Ramas:** se trabaja y se sube directo a `main`, sin PRs, en backend y frontend (decisión de Nilton, que hoy es el único que desarrolla). Antes de subir, `git pull`. **Excepción:** lo de la etapa internacional va en la rama `feat/final-internacional` y no entra a `main` hasta que Nilton confirme que se permite cambiar código después del cierre.
4. **IA real en el backend solo para el docente y la familia:** `POST /api/ai/ingest-document` y `POST /api/ai/family-home-explainer` llaman a Gemini por REST desde `services/gemini.ts`, sin SDK. Si la IA falla o no hay key, responden con respaldo (`usedFallback: true`) y lo avisan (RNF-03). La key va solo en el servidor, nunca con prefijo `NEXT_PUBLIC_`. El contenido escrito por niños no se envía a terceros desde este backend: foto, hipótesis y `validate-duel-question` siguen con `simulate` de `services/ai.ts`. La pantalla del duelo no pasa por aquí: usa `/api/gemini-duel` del frontend.
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
