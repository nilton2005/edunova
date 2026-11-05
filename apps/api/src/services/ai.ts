// Decisión del equipo: NO usamos API key de IA. Todos los endpoints "de IA" son simulados
// con respuestas deterministas y una latencia falsa para que el demo se vea real.
// `usedFallback` se mantiene en el contrato por compatibilidad y siempre vale true.

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1600;

export const fakeLatency = (ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function simulate<T>(produce: () => T): Promise<T> {
  await fakeLatency();
  return produce();
}

const LAB_KEYWORDS: Array<[RegExp, 'SOLAR_SYSTEM' | 'HUMAN_BODY' | 'MOLECULAR_LAB' | 'STUDYFI_PHYSICS' | 'EARTH_OS']> = [
  [/planeta|sol\b|sistema solar|órbita|orbita/i, 'SOLAR_SYSTEM'],
  [/anatom|órgano|organo|cuerpo humano|corazón|corazon/i, 'HUMAN_BODY'],
  [/molécula|molecula|átomo|atomo|enlace|químic|quimic/i, 'MOLECULAR_LAB'],
  [/física|fisica|circuito|óptica|optica|fuerza/i, 'STUDYFI_PHYSICS'],
  [/tierra|clima|ecosistema|cuenca/i, 'EARTH_OS'],
];

export function detectLab(text: string) {
  return LAB_KEYWORDS.find(([re]) => re.test(text))?.[1] ?? 'NONE';
}

const HYPOTHESIS_BONUS_XP = 20;
const MIN_HYPOTHESIS_LENGTH = 20;

// Una hipótesis debe plantear causa y efecto. Simulado: revisa la forma, no la ciencia.
export function reviewHypothesis(text: string) {
  const hypothesis = text.trim();
  if (hypothesis.length < MIN_HYPOTHESIS_LENGTH) {
    return { valid: false, feedback: 'Cuenta un poco más: ¿qué crees que pasaría y por qué?', bonusXP: 0 };
  }
  if (!/\b(si|porque|entonces|debido|por eso|ya que)\b/i.test(hypothesis)) {
    return { valid: false, feedback: 'Agrega la causa: usa "si..., entonces..." o "porque...".', bonusXP: 0 };
  }
  return {
    valid: true,
    feedback: 'Buena hipótesis: planteas una causa y un efecto que puedes comprobar en el laboratorio.',
    bonusXP: HYPOTHESIS_BONUS_XP,
  };
}
