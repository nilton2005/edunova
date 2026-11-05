# Alcance — 48 horas

Cada función está en uno de tres estados: **Real**, **Simulada** (datos semilla) o **Después** (solo pitch).

El frontend está en https://github.com/naohan/EduNova. Este repo cubre backend y contratos.

## Avance del frontend (a 2026-11-05)
Ya hechas con datos fijos, sin conectar a la API: panel del docente (resumen, competencias, evaluación, reportes, resultados, detalle de estudiante), vistas de estudiante (aula, lección, práctica, ruta, misiones, juegos, duelo, logros, progreso, habilidades) y dos visores 3D: **Sistema Solar** y **Cuerpo Humano**.

Faltan en el frontend: Camaleón por edad, escáner de foto, Studio del docente (subir PDF), portal de familia y PWA offline.

## P1 — Demo (obligatorio)
| Función | Estado | Backend | Frontend |
|---|---|---|---|
| Ingesta de PDF → subtemas + rúbrica editable + Aprobar y Publicar | Real | Líder | Faltan UI |
| Camaleón UI (3 edades) + ruta Descubre/Practica/Demuestra | Real | Líder (unidades) | En curso |
| Lab 3D Sistema Solar con +XP / NovaCoins | Real | Junior 1 | Visor hecho; falta conectar |
| Foto del cuaderno → análisis paso a paso | Real (con respaldo) | Líder | Falta UI |
| Vista Tutor Familiar + "Explicar en casa" | Real (con respaldo) | Líder | Falta UI |

## P2 — Si hay tiempo
| Función | Estado |
|---|---|
| Lab 3D Cuerpo Humano (visor ya hecho) | Real |
| Tienda de avatar y NovaCoins | Simulada |
| Ligas duales (Maestría / Superación) | Simulada |
| Duelo 1v1 y modo Fantasma | Simulada |
| Flashcards con repetición | Real |
| Indicador offline + caché de una lección | Real (mínimo) |
| Alertas explicables y Radar de Talentos | Simulada |

## P3 — Solo pitch
| Función | Estado |
|---|---|
| Tablero cooperativo en vivo (WebSocket) | Después |
| Labs 3D: Molecular, StudyFi, earthOS | Después (tarjetas "próximamente") |
| Benchmark real, Copa Intercolegial, Pasaporte QR | Simulada |
| Coevaluación con rúbrica | Después |

## Cronograma
- **Día 1:** contratos, API, datos semilla, conectar el frontend a la API.
- **Día 2:** foto del cuaderno, familia, tienda y ligas, integración.
- **Últimas 6 horas:** sin funciones nuevas. Ensayo del demo y corrección de bugs.

## Demo de 3 minutos
1. Ingesta docente y rúbrica (0:00–0:45)
2. Camaleón, lab 3D y offline (0:45–1:35)
3. Foto del cuaderno y juegos (1:35–2:20)
4. Gamificación, familia y benchmark (2:20–3:00)
