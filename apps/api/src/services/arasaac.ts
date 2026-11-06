import type { UnitWithKeywords } from './unitDraft.js';

// Servicio de búsqueda de pictogramas en ARASAAC (arasaac.org).
// Solo se envían palabras clave derivadas del material del docente o de la familia.
// Nunca se envían datos personales ni textos escritos por estudiantes.

export async function findPictogram(word: string): Promise<number | undefined> {
  const trimmed = word.trim().toLowerCase();
  if (!trimmed) return undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return undefined;

    const data: unknown = await res.json().catch(() => null);
    if (!Array.isArray(data) || !data.length) return undefined;

    for (const item of data) {
      if (
        item &&
        typeof item === 'object' &&
        '_id' in item &&
        typeof item._id === 'number' &&
        item.sex === false &&
        item.violence === false
      ) {
        return item._id;
      }
    }
    return undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

// Un fallo de ARASAAC nunca rompe la creación de la unidad: esa lección queda sin pictogramas.
export async function attachPictograms(unit: UnitWithKeywords) {
  const keywords = unit.keywordsBySubtopic;
  delete unit.keywordsBySubtopic;
  if (!keywords) return;
  await Promise.all(
    unit.subtopics.map(async (subtopic) => {
      const words = keywords.get(subtopic.id) ?? [];
      const pictos = await Promise.all(
        words.map(async (word) => {
          const id = await findPictogram(word);
          return id ? { word, id } : undefined;
        }),
      );
      const found = pictos.filter((p): p is { word: string; id: number } => p !== undefined);
      // Dos palabras pueden llevar al mismo dibujo: se muestra una sola vez.
      const unique = [...new Map(found.map((p) => [p.id, p])).values()];
      if (unique.length) subtopic.stages.discover.pictograms = unique;
    }),
  );
}
