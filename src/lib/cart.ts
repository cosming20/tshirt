import { COLORS, SIZES, type Color, type Size } from "@/lib/product";

export type CartItem = {
  size: Size;
  color: Color;
  quantity: number;
};

/** Cantitatea maximă per variantă într-o comandă — aceeași limită pe client și pe server. */
export const MAX_QUANTITY_PER_ITEM = 10;

export function cartItemKey(item: Pick<CartItem, "size" | "color">): string {
  return `${item.size}-${item.color}`;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Validează ce trimite clientul. Nu avem încredere în payload: cantitățile și
 * variantele vin din browser, iar prețurile sunt luate ulterior din Stripe după
 * mărime+culoare, niciodată din request.
 */
export function parseCartPayload(payload: unknown): CartItem[] | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;

  const items: CartItem[] = [];

  for (const raw of payload) {
    if (typeof raw !== "object" || raw === null) return null;
    const { size, color, quantity } = raw as Record<string, unknown>;

    if (!SIZES.includes(size as Size)) return null;
    if (!COLORS.some((c) => c.id === color)) return null;
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      return null;
    }

    items.push({ size: size as Size, color: color as Color, quantity });
  }

  // Aceeași variantă de două ori ar crea două linii separate în Stripe pentru același produs.
  const keys = items.map(cartItemKey);
  if (new Set(keys).size !== keys.length) return null;

  return items;
}
