import type { EventActivity } from '../../../../packages/shared-types/edunova-contract';

// Rastreo de Conocimiento Bayesiano (BKT, Corbett y Anderson 1995), con las mismas ecuaciones que
// OATutor. Estima la probabilidad de que el estudiante domine un criterio tras cada respuesta.
// Los parámetros son valores por defecto de la literatura: no están calibrados con datos propios.

export interface BktParams {
  transit: number; // probabilidad de aprender entre una oportunidad y la siguiente
  guess: number; // acertar sin dominar
  slip: number; // fallar dominando
}

const DEFAULT_PARAMS: BktParams = { transit: 0.1, guess: 0.2, slip: 0.1 };

// Una flashcard es autoevaluada: decir "la sabía" es evidencia más débil que elegir la opción correcta.
const PARAMS_BY_ACTIVITY: Partial<Record<EventActivity, Partial<BktParams>>> = {
  FLASHCARD: { guess: 0.35 },
};

/** Dominio inicial cuando todavía no hay ninguna evidencia del estudiante en ese criterio. */
export const INITIAL_MASTERY_PERCENT = 30;

export const paramsFor = (activity: EventActivity): BktParams => ({ ...DEFAULT_PARAMS, ...PARAMS_BY_ACTIVITY[activity] });

/** Probabilidad de dominio tras observar una respuesta. Entra y sale entre 0 y 1. */
export function updateMastery(probMastery: number, correct: boolean, params: BktParams = DEFAULT_PARAMS) {
  const { transit, guess, slip } = params;
  const known = probMastery * (correct ? 1 - slip : slip);
  const unknown = (1 - probMastery) * (correct ? guess : 1 - guess);
  const posterior = known / (known + unknown);
  return posterior + (1 - posterior) * transit;
}

/** La misma actualización sobre el porcentaje que se guarda. Es una estimación: nunca afirma 0 ni 100. */
export function updateMasteryPercent(percent: number, correct: boolean, activity: EventActivity) {
  const prob = Math.min(0.99, Math.max(0.01, percent / 100));
  const next = Math.round(updateMastery(prob, correct, paramsFor(activity)) * 100);
  return Math.min(99, Math.max(1, next));
}
