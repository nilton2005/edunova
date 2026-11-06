import { Router } from 'express';
import { asyncHandler } from '../services/async-handler.js';

export const pictograms = Router();

// GET /api/pictograms/:id
// Proxy de pictogramas de ARASAAC con caché pública de 7 días.
// Solo descarga desde el host oficial https://static.arasaac.org
pictograms.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!/^\d{1,7}$/.test(id)) {
      return res.status(400).json({ error: 'ID de pictograma inválido' });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const targetUrl = `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
      const upstream = await fetch(targetUrl, { signal: controller.signal });
      if (!upstream.ok) {
        return res.status(404).json({ error: 'Pictograma no encontrado' });
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.send(buffer);
    } catch {
      res.status(404).json({ error: 'No se pudo descargar el pictograma' });
    } finally {
      clearTimeout(timer);
    }
  })
);
