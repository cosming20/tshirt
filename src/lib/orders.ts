import type Stripe from "stripe";
import { COLORS, PRODUCT, SIZES, type Color, type Size } from "@/lib/product";

/**
 * Cheia custom field-ului "Culoare" pe care trebuie s-o setezi identic în
 * Stripe Dashboard pe fiecare din cele 5 Payment Links (Products > Payment
 * Links > [mărime] > Edit > Add custom field > Dropdown, key = "culoare",
 * cu opțiuni ale căror *chei* sunt exact "negru" și "alb" — vezi README).
 */
const COLOR_CUSTOM_FIELD_KEY = "culoare";

/** Mapare Price ID Stripe -> mărime, completată din variabilele de mediu (server-only). */
const PRICE_ID_TO_SIZE: Partial<Record<string, Size>> = {
  [process.env.STRIPE_PRICE_ID_S ?? ""]: "S",
  [process.env.STRIPE_PRICE_ID_M ?? ""]: "M",
  [process.env.STRIPE_PRICE_ID_L ?? ""]: "L",
  [process.env.STRIPE_PRICE_ID_XL ?? ""]: "XL",
  [process.env.STRIPE_PRICE_ID_XXL ?? ""]: "XXL",
};

export function resolveSizeFromPriceId(priceId: string | null | undefined): Size | undefined {
  if (!priceId) return undefined;
  return PRICE_ID_TO_SIZE[priceId];
}

export function resolveColorFromCustomFields(
  customFields: Stripe.Checkout.Session.CustomField[] | null | undefined,
): Color | undefined {
  const field = customFields?.find((f) => f.key === COLOR_CUSTOM_FIELD_KEY);
  const value = field?.dropdown?.value;
  return COLORS.find((c) => c.id === value)?.id;
}

export type OrderLine = {
  size: Size | undefined;
  color: Color | undefined;
  quantity: number;
};

export type ManufacturingOrder = {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  lines: OrderLine[];
  totalAmount: number | null;
  currency: string | null;
};

function colorLabel(color: Color | undefined): string {
  return COLORS.find((c) => c.id === color)?.label ?? "necunoscută (verifică manual în Stripe)";
}

function sizeLabel(size: Size | undefined): string {
  return size && SIZES.includes(size) ? size : "necunoscută (verifică manual în Stripe)";
}

export function buildOrderEmailSubject(order: ManufacturingOrder): string {
  return `Comandă nouă ${PRODUCT.name} — #${order.orderId.slice(-8)}`;
}

export function buildOrderEmailHtml(order: ManufacturingOrder): string {
  const rows = order.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #ddd;">${sizeLabel(line.size)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ddd;">${colorLabel(line.color)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ddd;">${line.quantity}</td>
      </tr>`,
    )
    .join("");

  const total =
    order.totalAmount != null && order.currency
      ? `${(order.totalAmount / 100).toFixed(2)} ${order.currency.toUpperCase()}`
      : "necunoscut";

  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;">
      <h2 style="margin:0 0 12px;">Comandă nouă — ${PRODUCT.name}</h2>
      <p style="margin:0 0 16px;">Comandă #${order.orderId}, total plătit ${total}.</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #111;">Mărime</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #111;">Culoare</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #111;">Bucăți</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin:16px 0 0;"><strong>Client:</strong> ${order.customerName ?? "—"} (${order.customerEmail ?? "—"})</p>
      <p style="margin:4px 0 0;"><strong>Adresă livrare:</strong> ${order.shippingAddress ?? "necompletată — verifică manual în Stripe"}</p>
    </div>`;
}
