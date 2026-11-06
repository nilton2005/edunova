// Cliente mínimo de Gemini por REST. La key vive solo en el servidor (GEMINI_API_KEY):
// nunca se manda al navegador ni se usa una variable NEXT_PUBLIC_.
// Solo recibe contenido docente: ningún dato ni imagen de estudiantes pasa por aquí.

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODELS = 'gemini-2.5-flash,gemini-3.5-flash';

export type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

export class GeminiError extends Error {}

export const hasGemini = () => Boolean(process.env.GEMINI_API_KEY);

const models = () =>
  (process.env.GEMINI_MODELS ?? DEFAULT_MODELS)
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

// Sin razonamiento extendido el primer modelo tarda unos 12 s en vez de 40 con un PDF.
const generationConfig = (model: string) =>
  model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {};

async function callModel(model: string, body: object, signal: AbortSignal) {
  const res = await fetch(`${API_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await res.json().catch(() => null)) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
    error?: { message?: string };
  } | null;
  if (!res.ok) throw new GeminiError(`${model}: HTTP ${res.status} ${data?.error?.message?.slice(0, 120) ?? ''}`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) throw new GeminiError(`${model}: respuesta vacía (${data?.candidates?.[0]?.finishReason ?? 'sin motivo'})`);
  return text;
}

/** Prueba cada modelo en orden dentro del tiempo total. Devuelve el texto y qué modelo respondió. */
async function generate(
  parts: GeminiPart[],
  { system, timeoutMs, ...config }: { system: string; timeoutMs: number; [key: string]: unknown },
) {
  const signal = AbortSignal.timeout(timeoutMs);
  let last: unknown;
  for (const model of models()) {
    try {
      const text = await callModel(
        model,
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.3, ...config, ...generationConfig(model) },
        },
        signal,
      );
      return { text, model };
    } catch (error) {
      last = error;
      if (signal.aborted) break;
    }
  }
  throw last instanceof GeminiError ? last : new GeminiError('Se agotó el tiempo de espera');
}

export async function generateJson<T>(parts: GeminiPart[], system: string, schema: object, timeoutMs: number) {
  const { text, model } = await generate(parts, {
    system,
    timeoutMs,
    responseMimeType: 'application/json',
    responseSchema: schema,
  });
  try {
    return { value: JSON.parse(text) as T, model };
  } catch {
    throw new GeminiError(`${model}: el JSON llegó incompleto`);
  }
}

export const generateText = (prompt: string, system: string, timeoutMs: number) =>
  generate([{ text: prompt }], { system, timeoutMs });
