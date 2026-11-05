# EduNova — reglas para agentes de IA (Claude Code / Cursor)

Hackathon Hack4Edu 2026. Entrega en **48 horas**, equipo de 4 devs. Prioridad: que el demo de 3 minutos funcione sin fallos.

## Reglas obligatorias
1. **Tipos:** importa SIEMPRE de `packages/shared-types/edunova-contract.ts`. No dupliques ni redefinas tipos. Si falta algo, pide cambio al líder.
2. **Carpetas:** cada persona trabaja solo en su carpeta de `features/` o `apps/`. No toques archivos de otros sin avisar.
3. **Ramas:** `feat/<modulo>-<tarea>`. PR pequeños a `main`. Nunca push directo a `main`.
4. **IA con respaldo (RNF-03):** todo endpoint de IA debe tener un modo determinista con datos pre-guardados si el LLM tarda más de 4 s o falla. Devuelve `usedFallback: true`.
5. **Datos simulados:** ligas, percentiles, Copa, Fantasma y Pasaporte QR usan datos semilla. Deben verse reales.
6. **Safe-Play:** solo alias, avatar, rango de edad e institución. Nunca apellidos, teléfonos ni geolocalización.
7. **Sin secretos en el repo:** las claves van en `.env` (ignorado por git). Repo público.
8. **Rúbrica oculta:** el estudiante ve misiones lúdicas, nunca la tabla de rúbrica.
9. **Aprobación docente:** la IA nunca publica una unidad sin el clic de "Aprobar y Publicar" (estado DRAFT → PUBLISHED).

## Alcance (ver docs/ALCANCE.md)
- P1 = demo. P2 = si hay tiempo. P3 = solo mencionado en el pitch.
- Congelamiento de funciones: últimas 6 horas, solo ensayo y arreglo de bugs.

## Idioma
Código en inglés, textos de interfaz y comentarios en español.
