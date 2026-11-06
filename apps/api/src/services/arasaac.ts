// Servicio de búsqueda de pictogramas en ARASAAC (arasaac.org).
// Solo se envían palabras clave derivadas del material educativo del docente.
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
