# Alcance — 48 horas

Cada función está en uno de tres estados: **Real**, **Simulada** (datos semilla) o **Después** (solo pitch).

El frontend está en https://github.com/naohan/EduNova. Este repo cubre backend y contratos.

## Avance del frontend (a 2026-11-05, commit ecaa201 de naohan)
Hecho, con datos fijos y **sin conectar a la API** (ninguna pantalla usa `lib/api` todavía):
- Panel del docente: resumen, competencias, evaluación, reportes (con pestaña de alertas), resultados y detalle de estudiante.
- Estudiante: pantalla Aprender con 4 cursos, **mapa 3D de Matemática** (3 islas, 6 estaciones, robot mascota; el avance se guarda en `localStorage`), aula, lección, práctica (una sola pregunta), ruta, misiones, juegos, duelo, logros, progreso y habilidades.
- Visores 3D: **Sistema Solar** y **Cuerpo Humano**.
- Cliente de la API (`lib/api`) listo y probado contra el backend, pero sin usar.

Faltan: selector de edad que cambie la interfaz (Camaleón), audio TTS, escáner de foto (solo existe la lista de tipos de evaluación), Studio del docente (subir PDF), portal de familia, flashcards con repetición, PWA offline y conectar todo a la API.

El estado por tarea está en el [tablero](https://github.com/users/nilton2005/projects/2).

## P1 — Demo (obligatorio)
| Función | Estado | Backend | Frontend |
|---|---|---|---|
| Ingesta de PDF → subtemas + rúbrica editable + Aprobar y Publicar | Real | Hecho | Falta UI (#7) |
| Camaleón UI (3 edades) + ruta Descubre/Practica/Demuestra | Real | Hecho | Ruta y mapa hechos; falta selector de edad (#8) y conectar (#9) |
| Lab 3D Sistema Solar con +XP / NovaCoins | Real | Hecho | Visores hechos; falta misión y conectar (#10) |
| Foto del cuaderno → análisis paso a paso | Real (simulada) | Hecho | Falta UI (#13) |
| Vista Tutor Familiar + "Explicar en casa" | Real (simulada) | Hecho | Falta UI (#15) |

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
