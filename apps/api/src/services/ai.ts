// RNF-03: todo endpoint de IA responde con el LLM en vivo o, si falla o tarda más de 4 s,
// con un respaldo determinista. Sin LLM_API_KEY siempre se usa el respaldo.

export const AI_TIMEOUT_MS = 4000;

export interface AiResult<T> {
  value: T;
  usedFallback: boolean;
}

export async function withFallback<T>(live: (() => Promise<T>) | null, fallback: () => T): Promise<AiResult<T>> {
  if (!live || !process.env.LLM_API_KEY) {
    return { value: fallback(), usedFallback: true };
  }
  try {
    const value = await Promise.race([
      live(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), AI_TIMEOUT_MS)),
    ]);
    return { value, usedFallback: false };
  } catch {
    return { value: fallback(), usedFallback: true };
  }
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
