import type { LearningEvent, TalentSignal } from '../../../../packages/shared-types/edunova-contract';
import { eventsOfStudents, listUsers } from '../data/db.js';

export const TALENT_DISCLAIMER =
  'Sugerencias exploratorias para observar en clase. No son etiquetas ni diagnósticos.';

export function calculateStudentTalents(
  studentId: string,
  alias: string,
  events: LearningEvent[],
): TalentSignal | undefined {
  const evidenceCount = events.length;
  // RF-04: Solo se devuelve señal si evidenceCount es 5 o más
  if (evidenceCount < 5) return undefined;

  // Sin evidencia el valor queda vacío: un 0 se leería como un punto débil del estudiante.
  // 1. logic: % de eventos LAB_3D con attempt 1 y correct true.
  const labEvents = events.filter((e) => e.activity === 'LAB_3D');
  const labAttempt1Correct = labEvents.filter(
    (e) => (e.attempt ?? 1) === 1 && e.correct === true,
  ).length;
  const logic = labEvents.length
    ? Math.round((labAttempt1Correct / labEvents.length) * 100)
    : undefined;

  // 2. autonomy: % de eventos de primer intento con correct true y hintsUsed 0.
  const firstAttempts = events.filter((e) => (e.attempt ?? 1) === 1);
  const autonomy = firstAttempts.length
    ? Math.round(
        (firstAttempts.filter((e) => e.correct === true && (e.hintsUsed ?? 0) === 0).length /
          firstAttempts.length) *
          100,
      )
    : 0;

  // 3. perseverance: de las preguntas cuyo primer intento falló, % que terminó con un evento correct true de la misma questionId. Sin fallos, 0.
  const questionsWithEvents = new Map<string, LearningEvent[]>();
  for (const e of events) {
    if (!e.questionId) continue;
    const list = questionsWithEvents.get(e.questionId) ?? [];
    list.push(e);
    questionsWithEvents.set(e.questionId, list);
  }

  let failedFirstCount = 0;
  let resolvedAfterFailureCount = 0;

  for (const [, qEvents] of questionsWithEvents.entries()) {
    const sorted = [...qEvents].sort((a, b) => {
      const attA = a.attempt ?? 1;
      const attB = b.attempt ?? 1;
      if (attA !== attB) return attA - attB;
      const timeA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
      const timeB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
      return timeA - timeB;
    });

    const first = sorted[0];
    if (first && !first.correct) {
      failedFirstCount++;
      const hasResolved = sorted.some((e) => e.correct === true);
      if (hasResolved) {
        resolvedAfterFailureCount++;
      }
    }
  }

  const perseverance = failedFirstCount
    ? Math.round((resolvedAfterFailureCount / failedFirstCount) * 100)
    : undefined;

  return {
    studentId,
    alias,
    logic,
    perseverance,
    autonomy,
    evidenceCount,
  };
}

export async function classroomTalents(classroomCode: string): Promise<TalentSignal[]> {
  const users = await listUsers();
  const students = users.filter((u) => u.role === 'STUDENT' && u.classroomCode === classroomCode);
  if (!students.length) return [];

  const studentIds = students.map((s) => s.id);
  const storedEvents = await eventsOfStudents(studentIds);

  const eventsByStudent = new Map<string, LearningEvent[]>();
  for (const { studentId, event } of storedEvents) {
    const list = eventsByStudent.get(studentId) ?? [];
    list.push(event);
    eventsByStudent.set(studentId, list);
  }

  const signals: TalentSignal[] = [];
  for (const s of students) {
    const studentEvents = eventsByStudent.get(s.id) ?? [];
    const signal = calculateStudentTalents(s.id, s.alias, studentEvents);
    if (signal) {
      signals.push(signal);
    }
  }

  return signals;
}

