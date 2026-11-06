import type {
  ClassAnalytics,
  ClassStudent,
  CriterionMastery,
  ExplainableAlert,
  LearningEvent,
  RubricCriterion,
} from '../../../../packages/shared-types/edunova-contract';
import { getProfile, lastEventByStudent, listAlertActions, listUnits, listUsers, masteryOf, setMastery } from '../data/db.js';
import { alertDiagnosis } from '../data/seed.js';
import { classroomTalents, TALENT_DISCLAIMER } from './talents.js';
import { INITIAL_MASTERY_PERCENT, updateMasteryPercent } from './bkt.js';

// Por debajo de este dominio un estudiante necesita refuerzo en ese criterio.
export const SUPPORT_THRESHOLD = 60;

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : 0;

// Criterios aprobados de las unidades publicadas del aula, sin repetir.
async function classCriteria(classId: string): Promise<RubricCriterion[]> {
  const byId = new Map<string, RubricCriterion>();
  for (const unit of await listUnits()) {
    if (unit.classroomCode !== classId || unit.status !== 'PUBLISHED') continue;
    for (const c of unit.rubric) if (!byId.has(c.id)) byId.set(c.id, c);
  }
  return [...byId.values()];
}

const classMembers = async (classId: string) =>
  (await listUsers()).filter((u) => u.role === 'STUDENT' && u.classroomCode === classId);

export async function overallProgress(studentId: string) {
  return average((await masteryOf(studentId)).map((m) => m.percent));
}

// Tema con menos dominio del estudiante, para el tutor y el docente.
export async function weakestTopic(studentId: string) {
  const [mastery, units] = await Promise.all([masteryOf(studentId), listUnits()]);
  const lowest = [...mastery].sort((a, b) => a.percent - b.percent)[0];
  return units.flatMap((u) => u.rubric).find((c) => c.id === lowest?.criterionId)?.topicName;
}

export async function classStudents(classId: string): Promise<ClassStudent[]> {
  const [criteria, members] = await Promise.all([classCriteria(classId), classMembers(classId)]);
  const students: Array<ClassStudent | undefined> = await Promise.all(members.map(async (user) => {
    const profile = await getProfile(user.id);
    if (!profile) return undefined;
    const percentById = new Map((await masteryOf(user.id)).map((m) => [m.criterionId, m.percent]));
    // Un criterio sin evidencia del estudiante no cuenta: una unidad recién publicada no es un 0.
    const mastery: CriterionMastery[] = criteria.flatMap((c) => {
      const masteryPercent = percentById.get(c.id);
      return masteryPercent === undefined
        ? []
        : [{ rubricCriterionId: c.id, topicName: c.topicName, masteryPercent }];
    });
    return {
      studentId: user.id,
      alias: user.alias,
      ageTier: user.ageTier,
      diagnosticTier: profile.diagnosticTier,
      streakDays: profile.streakDays,
      division: profile.leagues.division,
      overallMasteryPercent: average(mastery.map((m) => m.masteryPercent)),
      needsSupport: mastery.some((m) => m.masteryPercent < SUPPORT_THRESHOLD),
      mastery,
    };
  }));
  return students.filter((student): student is ClassStudent => student !== undefined);
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function classAlerts(classId: string): Promise<ExplainableAlert[]> {
  const students = await classStudents(classId);
  const studentIds = students.map((s) => s.studentId);
  const [criteria, attendedMap, lastEvents] = await Promise.all([
    classCriteria(classId),
    listAlertActions(),
    lastEventByStudent(studentIds),
  ]);

  const topicAlerts: ExplainableAlert[] = criteria.flatMap((c) => {
    const rows = students.flatMap((s) => s.mastery.filter((m) => m.rubricCriterionId === c.id));
    const affectedUnderThreshold = students
      .map((s) => {
        const m = s.mastery.find((item) => item.rubricCriterionId === c.id);
        return m && m.masteryPercent < SUPPORT_THRESHOLD
          ? { student: s, percent: m.masteryPercent }
          : null;
      })
      .filter((item): item is { student: ClassStudent; percent: number } => item !== null)
      .sort((a, b) => a.percent - b.percent);

    if (!affectedUnderThreshold.length || !rows.length) return [];
    const affectedPercent = Math.round((affectedUnderThreshold.length / rows.length) * 100);
    const diagnosis = alertDiagnosis[c.id] ?? `necesita refuerzo en «${c.topicName}»`;
    const alertId = `al-${classId}-${c.id}`;

    let groupDescription: string;
    let affectedAliases: string[];
    if (affectedUnderThreshold.length > 5) {
      const lowest5 = affectedUnderThreshold.slice(0, 5);
      affectedAliases = lowest5.map((a) => a.student.alias);
      groupDescription = 'los 5 que más lo necesitan';
    } else {
      affectedAliases = affectedUnderThreshold.map((a) => a.student.alias);
      groupDescription = affectedAliases.join(', ');
    }
    const suggestedAction = `Repasa «${c.topicName}» en grupo pequeño con ${groupDescription}. Empieza por una unidad o actividad de refuerzo.`;

    return [
      {
        id: alertId,
        classId,
        kind: 'TOPIC',
        message: `${affectedPercent}% del aula ${diagnosis}.`,
        affectedPercent,
        rubricCriterionId: c.id,
        suggestedAction,
        affectedAliases,
        attendedAt: attendedMap.get(alertId),
      },
    ];
  });

  // Alerta por inactividad (estudiantes con al menos un evento y cuyo último evento tiene 7 días o más)
  const now = Date.now();
  const inactiveStudents: ClassStudent[] = [];
  for (const s of students) {
    const lastEventStr = lastEvents.get(s.studentId);
    if (!lastEventStr) continue; // Quien nunca tuvo eventos no cuenta
    const lastDate = new Date(lastEventStr).getTime();
    if (now - lastDate >= SEVEN_DAYS_MS) {
      inactiveStudents.push(s);
    }
  }

  let inactivityAlert: ExplainableAlert | undefined;
  if (inactiveStudents.length > 0) {
    const n = inactiveStudents.length;
    const inactivityAlertId = `al-${classId}-inactivity`;
    inactivityAlert = {
      id: inactivityAlertId,
      classId,
      kind: 'INACTIVITY',
      message: `${n} ${n === 1 ? 'estudiante lleva' : 'estudiantes llevan'} 7 días o más sin actividad.`,
      affectedPercent: students.length ? Math.round((n / students.length) * 100) : 0,
      rubricCriterionId: undefined,
      suggestedAction: 'Conversa con cada estudiante o con su familia para saber si necesita ayuda.',
      affectedAliases: inactiveStudents.map((s) => s.alias),
      attendedAt: attendedMap.get(inactivityAlertId),
    };
  }

  return [...topicAlerts, ...(inactivityAlert ? [inactivityAlert] : [])];
}

export async function classAnalytics(classId: string): Promise<ClassAnalytics> {
  const [students, classRubric] = await Promise.all([classStudents(classId), classCriteria(classId)]);
  const criteria = classRubric.map((c) => {
    const rows = students.flatMap((s) => s.mastery.filter((m) => m.rubricCriterionId === c.id));
    return {
      rubricCriterionId: c.id,
      topicName: c.topicName,
      masteryPercent: average(rows.map((m) => m.masteryPercent)),
      studentsNeedingSupport: rows.filter((m) => m.masteryPercent < SUPPORT_THRESHOLD).length,
    };
  });
  return {
    classId,
    studentCount: students.length,
    averageMasteryPercent: average(students.map((s) => s.overallMasteryPercent)),
    criteria,
    alerts: await classAlerts(classId),
    talents: await classroomTalents(classId),
    talentDisclaimer: TALENT_DISCLAIMER,
  };
}

async function criteriaOfSubtopic(subtopicId: string) {
  const units = await listUnits();
  return new Set(units.flatMap((u) => u.rubric.filter((c) => c.subtopicId === subtopicId).map((c) => c.id)));
}

// RF-02: cada respuesta actualiza el dominio de los criterios de su subtema con BKT.
// Solo cuenta el primer intento sin pistas: después de una pista o un error, acertar ya no mide dominio.
export async function recordObservation(
  studentId: string,
  event: Pick<LearningEvent, 'activity' | 'correct' | 'subtopicId' | 'attempt' | 'hintsUsed'>,
) {
  if (!event.subtopicId || event.attempt > 1 || event.hintsUsed > 0) return;
  const criterionIds = await criteriaOfSubtopic(event.subtopicId);
  if (!criterionIds.size) return;
  const current = new Map((await masteryOf(studentId)).map((m) => [m.criterionId, m.percent]));
  for (const id of criterionIds) {
    const before = current.get(id) ?? INITIAL_MASTERY_PERCENT;
    await setMastery(studentId, id, updateMasteryPercent(before, event.correct, event.activity));
  }
}
