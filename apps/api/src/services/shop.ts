import type {
  GamificationAndBenchmarkProfile,
  Inventory,
  ShopItem,
} from '../../../../packages/shared-types/edunova-contract';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'gorra-exploradora', name: 'Gorra exploradora', emoji: '🧢', price: 200, slot: 'CABEZA' },
  { id: 'corona-supernova', name: 'Corona Supernova', emoji: '👑', price: 800, slot: 'CABEZA' },
  { id: 'lentes-astronauta', name: 'Lentes de astronauta', emoji: '🕶️', price: 300, slot: 'CARA' },
  { id: 'bufanda-estelar', name: 'Bufanda estelar', emoji: '🧣', price: 150, slot: 'CUELLO' },
  { id: 'mochila-cohete', name: 'Mochila cohete', emoji: '🎒', price: 500, slot: 'ESPALDA' },
];

export type ShopResult =
  | { ok: true; profile: GamificationAndBenchmarkProfile }
  | { ok: false; status: number; error: string };

export const inventoryOf = (p: GamificationAndBenchmarkProfile): Inventory => ({
  novaCoins: p.novaCoins,
  ownedItems: p.ownedItems ?? [],
  equippedItems: p.equippedItems,
});

// El precio y el saldo se validan aquí: el navegador no decide cuántas NovaCoins hay.
export function buyItem(profile: GamificationAndBenchmarkProfile, itemId: unknown): ShopResult {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, status: 404, error: 'Ese accesorio no existe' };
  const owned = profile.ownedItems ?? [];
  if (owned.includes(item.id)) return { ok: false, status: 409, error: 'Ya tienes ese accesorio' };
  if (profile.novaCoins < item.price) return { ok: false, status: 409, error: 'No te alcanzan las NovaCoins' };
  return {
    ok: true,
    profile: { ...profile, novaCoins: profile.novaCoins - item.price, ownedItems: [...owned, item.id] },
  };
}

// Pone o quita un accesorio. Solo uno por zona del avatar.
export function toggleItem(profile: GamificationAndBenchmarkProfile, itemId: unknown): ShopResult {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, status: 404, error: 'Ese accesorio no existe' };
  if (!(profile.ownedItems ?? []).includes(item.id)) {
    return { ok: false, status: 409, error: 'Primero tienes que comprarlo' };
  }
  const sameSlot = new Set(SHOP_ITEMS.filter((i) => i.slot === item.slot).map((i) => i.id));
  const others = profile.equippedItems.filter((id) => !sameSlot.has(id));
  const equippedItems = profile.equippedItems.includes(item.id) ? others : [...others, item.id];
  return { ok: true, profile: { ...profile, equippedItems } };
}
