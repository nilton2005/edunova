import { Router, type Request, type Response } from 'express';
import { getProfile, saveProfile } from '../data/db.js';
import { currentUser } from '../services/access.js';
import { asyncHandler } from '../services/async-handler.js';
import { buyItem, inventoryOf, SHOP_ITEMS, toggleItem, type ShopResult } from '../services/shop.js';

export const shop = Router();

shop.get('/items', (_req, res) => res.json(SHOP_ITEMS));

// Cada estudiante solo gasta sus NovaCoins: el id sale de la sesión, no del cuerpo de la petición.
function studentAction(action: typeof buyItem) {
  return async (req: Request, res: Response) => {
    const viewer = await currentUser(req);
    if (!viewer) return res.status(401).json({ error: 'Falta iniciar sesión' });
    if (viewer.role !== 'STUDENT') return res.status(403).json({ error: 'La tienda es solo para estudiantes' });
    const profile = await getProfile(viewer.id);
    if (!profile) return res.status(404).json({ error: 'Estudiante no encontrado' });

    const result: ShopResult = action(profile, req.body?.itemId);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    await saveProfile(result.profile);
    res.json(inventoryOf(result.profile));
  };
}

shop.post('/buy', asyncHandler(studentAction(buyItem)));
shop.post('/equip', asyncHandler(studentAction(toggleItem)));
