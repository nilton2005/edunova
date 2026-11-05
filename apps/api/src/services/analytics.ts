import type {
  ClassAnalytics,
  ClassStudent,
  CriterionMastery,
  ExplainableAlert,
  RubricCriterion,
} from '../../../../packages/shared-types/edunova-contract';
import { addMastery, getProfile, listUnits, listUsers, masteryOf } from '../data/db.js';
import { alertDiagnosis, talentSeed } from '../data/seed.js';

// Por debajo de este dominio un estudiante necesita refuerzo en ese criterio.
export const SUPPORT_THRESHOLD = 60;
const MISSION_MASTERY_GAIN = 10;

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
    const mastery: CriterionMastery[] = criteria.map((c) => ({
      rubricCriterionId: c.id,
      topicName: c.topicName,
      masteryPercent: percentById.get(c.id) ?? 0,
    }));
    return {
      studentId: user.id,
      alias: user.alias,
      ageTier: user.ageTier,
      streakDays: profile.streakDays,
      division: profile.leagues.division,
      overallMasteryPercent: average(mastery.map((m) => m.masteryPercent)),
      needsSupport: mastery.some((m) => m.masteryPercent < SUPPORT_THRESHOLD),
      mastery,
    };
  }));
  return students.filter((student): student is ClassStudent => student !== undefined);
}

export async function classAlerts(classId: string): Promise<ExplainableAlert[]> {
  const [students, criteria] = await Promise.all([classStudents(classId), classCriteria(classId)]);
  return criteria.flatMap((c) => {
    const diagnosis = alertDiagnosis[c.id];
    if (!diagnosis || !students.length) return [];
    const affected = students.filter((s) =>
      s.mastery.some((m) => m.rubricCriterionId === c.id && m.masteryPercent < SUPPORT_THRESHOLD),
    ).length;
    if (!affected) return [];
    const affectedPercent = Math.round((affected / students.length) * 100);
    return [
      {
        id: `al-${classId}-${c.id}`,
        classId,
        message: `${affectedPercent}% del aula ${diagnosis}.`,
        affectedPercent,
        rubricCriterionId: c.id,
      },
    ];
  });
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
    talents: students.flatMap((s) => {
      const signal = talentSeed[s.studentId];
      return signal ? [{ studentId: s.studentId, alias: s.alias, ...signal }] : [];
    }),
    talentDisclaimer: 'Sugerencias exploratorias para observar en clase. No son etiquetas ni diagnósticos.',
  };
}

// RF-02: cada misión superada sube el dominio de los criterios de su subtema.
export async function recordMissionMastery(studentId: string, subtopicId: string) {
  const criterionIds = new Set(
    (await listUnits()).flatMap((u) => u.rubric.filter((c) => c.subtopicId === subtopicId).map((c) => c.id)),
  );
  for (const id of criterionIds) await addMastery(studentId, id, MISSION_MASTERY_GAIN);
}
