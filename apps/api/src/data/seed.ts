import type {
  BenchmarkResult,
  GamificationAndBenchmarkProfile,
  HandwrittenAnalysis,
  LearningEvent,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';

// Datos semilla que se insertan en PostgreSQL al inicializar la base.

export const users: User[] = [
  { id: 'u-teacher-1', role: 'TEACHER', alias: 'Profe Ana', classroomCode: 'EDU-402' },
  { id: 'u-student-1', role: 'STUDENT', alias: 'Gloria', ageTier: 'AVENTURERO_10_12', classroomCode: 'EDU-402' },
  { id: 'u-student-2', role: 'STUDENT', alias: 'Mateo', ageTier: 'EXPLORADOR_7_9', classroomCode: 'EDU-402' },
  { id: 'u-student-3', role: 'STUDENT', alias: 'Sofía', ageTier: 'CREADOR_13_15', classroomCode: 'EDU-402' },
  { id: 'u-student-seed-5', role: 'STUDENT', alias: 'Valentina', ageTier: 'AVENTURERO_10_12', classroomCode: 'EDU-402' },
  { id: 'u-student-seed-6', role: 'STUDENT', alias: 'Diego', ageTier: 'AVENTURERO_10_12', classroomCode: 'EDU-402' },
  { id: 'u-student-seed-9', role: 'STUDENT', alias: 'Isabella', ageTier: 'AVENTURERO_10_12', classroomCode: 'EDU-402' },
  { id: 'u-family-1', role: 'FAMILY_TUTOR', alias: 'Mamá de Gloria' },
];

const solarSubtopics = [
  { title: '1. ¿Qué es el Sistema Solar?', mission: 'Encuentra el Sol y toca el planeta más cercano.' },
  { title: '2. Los planetas rocosos', mission: 'Viaja a Marte y descubre por qué se ve rojo.' },
  { title: '3. Los gigantes gaseosos', mission: 'Encuentra el planeta más grande: Júpiter.' },
];

export const solarSystemUnit: LearningUnit = {
  id: 'unit-solar-system',
  title: 'Sistema Solar',
  status: 'PUBLISHED',
  teacherId: 'u-teacher-1',
  classroomCode: 'EDU-402',
  subtopics: solarSubtopics.map((s, i) => ({
    id: `st-solar-${i + 1}`,
    order: i + 1,
    title: s.title,
    status: i === 0 ? 'IN_PROGRESS' : 'LOCKED',
    offlineCached: false,
    lab3DIntegration: {
      type: 'SOLAR_SYSTEM',
      repoUrl: 'https://github.com/Ozymandros/solar-system',
      missionPrompt: s.mission,
      rewardXP: 150,
      rewardCoins: 50,
    },
    stages: {
      discover: {
        storyTextByAge: {
          EXPLORADOR_7_9: 'Hace mucho tiempo, una estrella gigante llamada Sol tenía ocho planetas amigos que giraban a su alrededor.',
          AVENTURERO_10_12: 'El Sistema Solar es el conjunto formado por el Sol y los cuerpos que giran a su alrededor: planetas, lunas y asteroides.',
          CREADOR_13_15: 'La gravedad del Sol mantiene en órbita a los planetas. ¿Qué pasaría con las órbitas si el Sol tuviera la mitad de su masa?',
        },
        audioUrl: '',
      },
      practice: {
        flashcards: [
          { id: `fc-${i}-1`, front: '¿Cuál es el planeta más grande?', back: 'Júpiter' },
          { id: `fc-${i}-2`, front: '¿Qué planeta se ve rojo?', back: 'Marte' },
        ],
        gameMode: 'flashcards',
      },
      demonstrate: { questions: [], acceptsHandwrittenPhoto: false, reasoningBonusXP: 20 },
    },
  })),
  rubric: solarSubtopics.map((s, i) => ({
    id: `rc-solar-${i + 1}`,
    subtopicId: `st-solar-${i + 1}`,
    topicName: s.title.replace(/^\d+\.\s*/, ''),
    evaluationCriterion: 'Identifica y explica las características del tema',
    suggestedActivity: 'Explorar modelo 3D',
    approvedByTeacher: true,
  })),
};

export const fractionsUnit: LearningUnit = {
  id: 'unit-fractions',
  title: 'Mundo de las Fracciones',
  status: 'PUBLISHED',
  teacherId: 'u-teacher-1',
  classroomCode: 'EDU-402',
  subtopics: [
    {
      id: 'st-frac-1',
      order: 1,
      title: '1. ¿Qué es una fracción?',
      status: 'IN_PROGRESS',
      offlineCached: false,
      lab3DIntegration: { type: 'NONE', repoUrl: '', missionPrompt: '', rewardXP: 100, rewardCoins: 30 },
      stages: {
        discover: {
          storyTextByAge: {
            EXPLORADOR_7_9: 'Una pizza se parte en partes iguales. Cada parte es una fracción.',
            AVENTURERO_10_12: 'Una fracción representa partes iguales de un todo: numerador sobre denominador.',
            CREADOR_13_15: 'Una fracción es un cociente a/b. ¿Cómo sumarías 1/3 + 1/4 sin usar calculadora?',
          },
          audioUrl: '',
        },
        practice: {
          flashcards: [{ id: 'fc-f-1', front: '¿Qué indica el denominador?', back: 'En cuántas partes iguales se divide el todo' }],
          gameMode: 'flashcards',
        },
        demonstrate: { questions: [], acceptsHandwrittenPhoto: true, reasoningBonusXP: 20 },
      },
    },
  ],
  rubric: [
    {
      id: 'rc-frac-1',
      subtopicId: 'st-frac-1',
      topicName: 'Suma de fracciones',
      evaluationCriterion: 'Resuelve operaciones y explica el procedimiento',
      suggestedActivity: 'Resolver problema contextualizado',
      approvedByTeacher: true,
    },
  ],
};

export const ahorroUnit: LearningUnit = {
  id: 'unit-ruta-ahorro',
  title: 'El ahorro en casa',
  status: 'PUBLISHED',
  classroomCode: 'COMUNIDAD',
  teacherId: 'u-teacher-1',
  sharedWithFamilies: true,
  familyCategory: 'AHORRO',
  rubric: [],
  subtopics: [
    {
      id: 'st-ahorro-1',
      order: 1,
      title: '1. ¿Por qué guardamos para el futuro?',
      status: 'IN_PROGRESS',
      offlineCached: false,
      lab3DIntegration: { type: 'NONE', repoUrl: '', missionPrompt: '', rewardXP: 100, rewardCoins: 30 },
      stages: {
        discover: {
          storyTextByAge: {
            EXPLORADOR_7_9: 'Guardar una moneda en una alcancía es como cuidar una semillita que crecerá con paciencia.',
            AVENTURERO_10_12: 'El ahorro nos ayuda a estar preparados ante imprevistos y a alcanzar metas familiares importantes.',
            CREADOR_13_15: 'Diferenciar entre necesidades y deseos es la clave para armar un presupuesto familiar equilibrado.',
          },
          audioUrl: '',
        },
        practice: {
          flashcards: [
            { id: 'fc-ah-1-1', front: '¿Qué es el ahorro?', back: 'Guardar parte de lo que recibimos para usarlo más adelante.' },
            { id: 'fc-ah-1-2', front: '¿Qué es una necesidad básica?', back: 'Algo indispensable para vivir, como alimento, salud o educación.' },
          ],
          gameMode: 'flashcards',
        },
        demonstrate: {
          questions: [
            {
              id: 'q-ah-1-1',
              prompt: '¿Cuál de los siguientes gastos representa una necesidad básica?',
              options: ['Comida nutritiva para la semana', 'Un juguete que vimos en televisión', 'Golosinas todos los días', 'Ropa de moda muy cara'],
              answerIndex: 0,
              hint: 'Piensa en aquello sin lo cual no podríamos estar sanos.',
              rubricCriterionId: '',
            },
            {
              id: 'q-ah-1-2',
              prompt: '¿Por qué es importante tener un fondo de ahorro en la familia?',
              options: ['Para gastarlo todo en un día de fiesta', 'Para afrontar emergencias y gastos inesperados', 'Para competir con otras familias', 'Para no tener que volver a estudiar'],
              answerIndex: 1,
              hint: 'Tener ahorros brinda seguridad cuando surge un problema imprevisto.',
              rubricCriterionId: '',
            },
          ],
          acceptsHandwrittenPhoto: false,
          reasoningBonusXP: 0,
        },
      },
    },
    {
      id: 'st-ahorro-2',
      order: 2,
      title: '2. Hábitos de ahorro en el hogar',
      status: 'LOCKED',
      offlineCached: false,
      lab3DIntegration: { type: 'NONE', repoUrl: '', missionPrompt: '', rewardXP: 100, rewardCoins: 30 },
      stages: {
        discover: {
          storyTextByAge: {
            EXPLORADOR_7_9: 'Apagar la luz y cerrar el caño del agua también es ahorrar en familia.',
            AVENTURERO_10_12: 'Cuidar los recursos del hogar como la energía y los alimentos evita gastos innecesarios.',
            CREADOR_13_15: 'El consumo responsable reduce costos fijos y fortalece la sostenibilidad económica de la familia.',
          },
          audioUrl: '',
        },
        practice: {
          flashcards: [
            { id: 'fc-ah-2-1', front: '¿Cómo cuidamos la energía en casa?', back: 'Apagando luces y desconectando artefactos que no usamos.' },
            { id: 'fc-ah-2-2', front: '¿Qué hábito ayuda a no gastar de más al comprar?', back: 'Hacer una lista de compras antes de salir al mercado.' },
          ],
          gameMode: 'flashcards',
        },
        demonstrate: {
          questions: [
            {
              id: 'q-ah-2-1',
              prompt: '¿Qué acción cotidiana ayuda a ahorrar agua en casa?',
              options: ['Cerrar el caño mientras nos cepillamos', 'Dejar la manguera abierta en el patio', 'Bañarse durante una hora entera', 'Lavar los platos con el chorro abierto al máximo'],
              answerIndex: 0,
              hint: 'Cerrar la llave cuando no usamos el agua evita el desperdicio.',
              rubricCriterionId: '',
            },
            {
              id: 'q-ah-2-2',
              prompt: '¿Cuál es el beneficio de planificar las compras con una lista?',
              options: ['Comprar solo lo necesario y evitar compras impulsivas', 'Olvidar lo que íbamos a comprar', 'Gastar el triple del dinero presupuestado', 'Comprar cosas que no necesitamos'],
              answerIndex: 0,
              hint: 'Una lista ayuda a mantenernos enfocados en lo necesario.',
              rubricCriterionId: '',
            },
          ],
          acceptsHandwrittenPhoto: false,
          reasoningBonusXP: 0,
        },
      },
    },
  ],
};

export const inglesUnit: LearningUnit = {
  id: 'unit-ruta-ingles',
  title: 'Inglés para empezar',
  status: 'PUBLISHED',
  classroomCode: 'COMUNIDAD',
  teacherId: 'u-teacher-1',
  sharedWithFamilies: true,
  familyCategory: 'IDIOMAS',
  rubric: [],
  subtopics: [
    {
      id: 'st-ingles-1',
      order: 1,
      title: '1. Saludos y cortesía (Greetings)',
      status: 'IN_PROGRESS',
      offlineCached: false,
      lab3DIntegration: { type: 'NONE', repoUrl: '', missionPrompt: '', rewardXP: 100, rewardCoins: 30 },
      stages: {
        discover: {
          storyTextByAge: {
            EXPLORADOR_7_9: 'Decir "Hello" y "Thank you" nos ayuda a hacer amigos en cualquier parte del mundo.',
            AVENTURERO_10_12: 'Aprender expresiones básicas en inglés nos abre puertas para comunicarnos con personas de otros lugares.',
            CREADOR_13_15: 'La cortesía y los saludos cotidianos en inglés son la base para construir conversaciones con confianza.',
          },
          audioUrl: '',
        },
        practice: {
          flashcards: [
            { id: 'fc-in-1-1', front: '¿Cómo se dice "Buenos días"?', back: 'Good morning' },
            { id: 'fc-in-1-2', front: '¿Cómo se dice "Gracias" y "Por favor"?', back: 'Thank you and Please' },
          ],
          gameMode: 'flashcards',
        },
        demonstrate: {
          questions: [
            {
              id: 'q-in-1-1',
              prompt: '¿Cómo saludas a alguien por la mañana en inglés?',
              options: ['Good morning', 'Good night', 'Goodbye', 'See you'],
              answerIndex: 0,
              hint: '"Morning" significa mañana.',
              rubricCriterionId: '',
            },
            {
              id: 'q-in-1-2',
              prompt: '¿Qué respondes cuando alguien te dice "Thank you"?',
              options: ["You're welcome", 'Yes, please', 'Hello', 'Good night'],
              answerIndex: 0,
              hint: 'Significa "De nada" en inglés.',
              rubricCriterionId: '',
            },
          ],
          acceptsHandwrittenPhoto: false,
          reasoningBonusXP: 0,
        },
      },
    },
    {
      id: 'st-ingles-2',
      order: 2,
      title: '2. Mi familia y mi hogar (Family and Home)',
      status: 'LOCKED',
      offlineCached: false,
      lab3DIntegration: { type: 'NONE', repoUrl: '', missionPrompt: '', rewardXP: 100, rewardCoins: 30 },
      stages: {
        discover: {
          storyTextByAge: {
            EXPLORADOR_7_9: 'En nuestro hogar decimos "mother", "father" y "family" con mucho amor.',
            AVENTURERO_10_12: 'Reconocer los miembros de la familia y los espacios de la casa enriquece nuestro vocabulario en inglés.',
            CREADOR_13_15: 'Describir a nuestra familia y nuestro entorno en inglés afianza las estructuras gramaticales básicas.',
          },
          audioUrl: '',
        },
        practice: {
          flashcards: [
            { id: 'fc-in-2-1', front: '¿Cómo se dice "madre" y "padre"?', back: 'Mother and Father' },
            { id: 'fc-in-2-2', front: '¿Cómo se dice "casa" y "familia"?', back: 'House / Home and Family' },
          ],
          gameMode: 'flashcards',
        },
        demonstrate: {
          questions: [
            {
              id: 'q-in-2-1',
              prompt: '¿Qué significa la palabra "brother" en español?',
              options: ['Hermano', 'Hermana', 'Padre', 'Tío'],
              answerIndex: 0,
              hint: 'Es un familiar varón de tu misma generación.',
              rubricCriterionId: '',
            },
            {
              id: 'q-in-2-2',
              prompt: '¿Cómo se traduce "Esta es mi casa" al inglés?',
              options: ['This is my house', 'This is my car', 'This is my book', 'This is my school'],
              answerIndex: 0,
              hint: '"House" significa casa.',
              rubricCriterionId: '',
            },
          ],
          acceptsHandwrittenPhoto: false,
          reasoningBonusXP: 0,
        },
      },
    },
  ],
};

export const units: LearningUnit[] = [solarSystemUnit, fractionsUnit, ahorroUnit, inglesUnit];

const divisions = ['BRONCE', 'PLATA', 'ORO', 'SUPERNOVA'] as const;
const aliases = ['Gloria', 'Mateo', 'Sofía', 'Lucas', 'Valentina', 'Diego', 'Camila', 'Andrés', 'Isabella', 'Samuel'];
// Los índices 0, 1, 2, 4, 5 y 8 son el aula EDU-402 (ver `users`); el resto compite desde fuera.
const contexts: Array<[GamificationAndBenchmarkProfile['learningContext'], string | undefined]> = [
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['INDEPENDENT_HOME', undefined],
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['EXTERNAL_INSTITUTION', 'I.E. Los Andes'],
  ['INDEPENDENT_HOME', undefined],
  ['SCHOOL_CLASSROOM', 'Colegio San Martín'],
  ['EXTERNAL_INSTITUTION', 'Escuela Rural Esperanza'],
];

export const profiles: GamificationAndBenchmarkProfile[] = aliases.map((alias, i) => ({
  studentId: i < 3 ? `u-student-${i + 1}` : `u-student-seed-${i + 1}`,
  learningContext: contexts[i][0],
  institutionName: contexts[i][1],
  familyTutorLinkedId: i === 0 ? 'u-family-1' : undefined,
  streakDays: 12 - i,
  novaCoins: 1240 - i * 90,
  leagues: {
    masteryPoints: 980 - i * 70,
    effortPoints: 600 + ((i * 53) % 300),
    division: divisions[Math.max(0, 3 - Math.floor(i / 3))],
  },
  badges: i < 4 ? ['Explorador Espacial'] : [],
  equippedItems: [],
}));

export const aliasByStudent: Record<string, string> = Object.fromEntries(
  profiles.map((p, i) => [p.studentId, aliases[i]]),
);

// Dominio inicial por criterio (RF-02), en el orden de `criterionIds`.
const criterionIds = ['rc-solar-1', 'rc-solar-2', 'rc-solar-3', 'rc-frac-1'];
const masteryByStudent: Record<string, number[]> = {
  'u-student-1': [92, 85, 80, 72],
  'u-student-2': [78, 55, 70, 48],
  'u-student-3': [95, 90, 88, 84],
  'u-student-seed-5': [80, 74, 68, 66],
  'u-student-seed-6': [70, 62, 60, 52],
  'u-student-seed-9': [85, 78, 75, 70],
};

export const masterySeed = profiles.flatMap((p) =>
  criterionIds.map((criterionId, i) => ({
    studentId: p.studentId,
    criterionId,
    percent: (masteryByStudent[p.studentId] ?? [65, 60, 55, 50])[i],
  })),
);

// Texto de la alerta explicable por criterio (RF-04). El porcentaje se calcula con el dominio real.
export const alertDiagnosis: Record<string, string> = {
  'rc-frac-1': 'comprende el numerador pero falla al hallar el denominador común en sumas heterogéneas',
  'rc-solar-2': 'confunde planetas rocosos con gigantes gaseosos',
};

export function benchmarkFor(studentId: string): BenchmarkResult {
  const idx = Math.max(0, profiles.findIndex((p) => p.studentId === studentId));
  return {
    studentId,
    ageRange: '10-12',
    percentile: 78 - idx * 4,
    vsClassroom: 8 - idx,
    vsOtherInstitutions: 5 - idx,
    vsIndependentLearners: 12 - idx,
  };
}

// Respaldo determinista de la foto del cuaderno (RNF-03): hoja de prueba "1/3 + 1/4".
export const handwrittenFallback: HandwrittenAnalysis = {
  steps: [
    { line: 1, text: '1/3 + 1/4', verdict: 'CORRECT', feedback: 'Planteaste bien la suma.' },
    { line: 2, text: '= 2/7', verdict: 'CONCEPT_ERROR', feedback: 'Sumaste numeradores y denominadores. Primero busca un denominador común.' },
    { line: 3, text: '= 7/12', verdict: 'CORRECT', feedback: '¡Ese es el resultado correcto, 3/12 + 4/12!' },
  ],
  reasoningBonusXP: 20,
  usedFallback: true,
};

export function buildSeedLearningEvents(): Array<{ studentId: string; event: LearningEvent }> {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const results: Array<{ studentId: string; event: LearningEvent }> = [];

  // Estudiante 1 (Gloria): Activa recientemente. Alta autonomía y lógica.
  const t1Base = now - 3 * DAY_MS;
  for (let i = 1; i <= 20; i++) {
    const isLab = i % 4 === 0;
    const qId = `q-gloria-${Math.ceil(i / 2)}`;
    const eventTime = new Date(t1Base + i * 3 * HOUR_MS).toISOString();
    results.push({
      studentId: 'u-student-1',
      event: {
        id: `seed-gloria-${i}`,
        activity: isLab ? 'LAB_3D' : (i % 2 === 0 ? 'QUIZ' : 'FLASHCARD'),
        correct: i % 6 !== 0,
        subtopicId: 'sub-solar-1',
        questionId: qId,
        attempt: 1,
        hintsUsed: 0,
        timeMs: 4500 + i * 200,
        occurredAt: eventTime,
      },
    });
  }

  // Estudiante 2 (Mateo): Inactivo desde hace 9 días (último evento hace 9 días y 2 horas).
  // Perfil con alta perseverancia: varios fallos iniciales resueltos con aciertos posteriores.
  const t2Base = now - 15 * DAY_MS;
  for (let i = 1; i <= 20; i++) {
    const isSecondAttempt = i % 2 === 0;
    const qIndex = Math.ceil(i / 2);
    const qId = `q-mateo-${qIndex}`;
    const eventTime = new Date(t2Base + i * 6 * HOUR_MS).toISOString();
    results.push({
      studentId: 'u-student-2',
      event: {
        id: `seed-mateo-${i}`,
        activity: i % 3 === 0 ? 'LAB_3D' : 'QUIZ',
        correct: isSecondAttempt,
        subtopicId: 'sub-frac-1',
        questionId: qId,
        attempt: isSecondAttempt ? 2 : 1,
        hintsUsed: isSecondAttempt ? 1 : 0,
        timeMs: 6000 + i * 150,
        occurredAt: eventTime,
      },
    });
  }
  // Forzar que el último evento de Mateo sea exactamente hace 9 días y 2 horas
  const mateoLast = results.find((r) => r.event.id === 'seed-mateo-20');
  if (mateoLast) {
    mateoLast.event.occurredAt = new Date(now - 9 * DAY_MS - 2 * HOUR_MS).toISOString();
  }

  // Estudiante 3 (Sofía): Activa ayer. Alta lógica y autonomía sobresaliente.
  const t3Base = now - 4 * DAY_MS;
  for (let i = 1; i <= 20; i++) {
    const isLab = i % 2 === 0;
    const qId = `q-sofia-${i}`;
    const eventTime = new Date(t3Base + i * 4 * HOUR_MS).toISOString();
    results.push({
      studentId: 'u-student-3',
      event: {
        id: `seed-sofia-${i}`,
        activity: isLab ? 'LAB_3D' : 'QUIZ',
        correct: true,
        subtopicId: 'sub-solar-2',
        questionId: qId,
        attempt: 1,
        hintsUsed: 0,
        timeMs: 3200 + i * 100,
        occurredAt: eventTime,
      },
    });
  }

  return results;
}
