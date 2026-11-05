import type {
  BenchmarkResult,
  ExplainableAlert,
  GamificationAndBenchmarkProfile,
  HandwrittenAnalysis,
  LearningUnit,
  User,
} from '../../../../packages/shared-types/edunova-contract';

// Datos semilla en memoria. Issue #2: reemplazar por base de datos real.

export const users: User[] = [
  { id: 'u-teacher-1', role: 'TEACHER', alias: 'Profe Ana', classroomCode: 'EDU-402' },
  { id: 'u-student-1', role: 'STUDENT', alias: 'Gloria', ageTier: 'AVENTURERO_10_12', classroomCode: 'EDU-402' },
  { id: 'u-student-2', role: 'STUDENT', alias: 'Mateo', ageTier: 'EXPLORADOR_7_9', classroomCode: 'EDU-402' },
  { id: 'u-student-3', role: 'STUDENT', alias: 'Sofía', ageTier: 'CREADOR_13_15', classroomCode: 'EDU-402' },
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
const schools = ['Colegio San Martín', 'I.E. Los Andes', 'Escuela Rural Esperanza', undefined];

export const profiles: GamificationAndBenchmarkProfile[] = aliases.map((alias, i) => ({
  studentId: i < 3 ? `u-student-${i + 1}` : `u-student-seed-${i + 1}`,
  learningContext: i % 4 === 3 ? 'INDEPENDENT_HOME' : i % 4 === 2 ? 'EXTERNAL_INSTITUTION' : 'SCHOOL_CLASSROOM',
  institutionName: schools[i % 4],
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

export const explainableAlerts: ExplainableAlert[] = [
  {
    id: 'al-1',
    classId: 'EDU-402',
    message: '34% del aula comprende el numerador pero falla al hallar el denominador común en sumas heterogéneas.',
    affectedPercent: 34,
    rubricCriterionId: 'rc-frac-1',
  },
  {
    id: 'al-2',
    classId: 'EDU-402',
    message: '22% del aula confunde planetas rocosos con gigantes gaseosos.',
    affectedPercent: 22,
    rubricCriterionId: 'rc-solar-2',
  },
];

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
