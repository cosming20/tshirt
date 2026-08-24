import { parseCartPayload, type CartItem } from "@/lib/cart";
import { parseShippingAddress, type ShippingAddress } from "@/lib/shipping";

export type CheckoutRequest = {
  items: CartItem[];
  shipping: ShippingAddress;
};

export function parseCheckoutRequest(payload: unknown): CheckoutRequest | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { items, shipping } = payload as Record<string, unknown>;
  const parsedItems = parseCartPayload(items);
  const parsedShipping = parseShippingAddress(shipping);
  if (!parsedItems || !parsedShipping) return null;
  return { items: parsedItems, shipping: parsedShipping };
}
