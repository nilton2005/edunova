import type {
  BenchmarkResult,
  GamificationAndBenchmarkProfile,
  HandwrittenAnalysis,
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

export const units: LearningUnit[] = [solarSystemUnit, fractionsUnit];

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

// Radar de Talentos (simulado, ver docs/ALCANCE.md).
export const talentSeed: Record<string, { creativity: number; collaboration: number; logic: number }> = {
  'u-student-1': { creativity: 82, collaboration: 74, logic: 88 },
  'u-student-2': { creativity: 90, collaboration: 68, logic: 55 },
  'u-student-3': { creativity: 76, collaboration: 60, logic: 94 },
  'u-student-seed-5': { creativity: 64, collaboration: 92, logic: 70 },
  'u-student-seed-6': { creativity: 58, collaboration: 86, logic: 62 },
  'u-student-seed-9': { creativity: 72, collaboration: 70, logic: 78 },
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
