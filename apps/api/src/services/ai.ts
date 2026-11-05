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
