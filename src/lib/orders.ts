import { COLORS, PRODUCT, SIZES, type Color, type Size } from "@/lib/product";

export type Variant = { size: Size; color: Color };

/**
 * Mapare Price ID Stripe -> variantă (mărime + culoare), completată din
 * variabilele de mediu (server-only). Fiecare combinație e un preț distinct în
 * Stripe, deci culoarea e determinată de ce a cumpărat clientul, nu de o
 * alegere separată pe care ar putea s-o greșească la checkout.
 */
const PRICE_ID_TO_VARIANT: Partial<Record<string, Variant>> = {
  [process.env.STRIPE_PRICE_ID_S_NEGRU ?? ""]: { size: "S", color: "negru" },
  [process.env.STRIPE_PRICE_ID_S_ALB ?? ""]: { size: "S", color: "alb" },
  [process.env.STRIPE_PRICE_ID_M_NEGRU ?? ""]: { size: "M", color: "negru" },
  [process.env.STRIPE_PRICE_ID_M_ALB ?? ""]: { size: "M", color: "alb" },
  [process.env.STRIPE_PRICE_ID_L_NEGRU ?? ""]: { size: "L", color: "negru" },
  [process.env.STRIPE_PRICE_ID_L_ALB ?? ""]: { size: "L", color: "alb" },
  [process.env.STRIPE_PRICE_ID_XL_NEGRU ?? ""]: { size: "XL", color: "negru" },
  [process.env.STRIPE_PRICE_ID_XL_ALB ?? ""]: { size: "XL", color: "alb" },
  [process.env.STRIPE_PRICE_ID_XXL_NEGRU ?? ""]: { size: "XXL", color: "negru" },
  [process.env.STRIPE_PRICE_ID_XXL_ALB ?? ""]: { size: "XXL", color: "alb" },
};

export function resolveVariantFromPriceId(
  priceId: string | null | undefined,
): Variant | undefined {
  if (!priceId) return undefined;
  return PRICE_ID_TO_VARIANT[priceId];
}

export type OrderLine = {
  variant: Variant | undefined;
  quantity: number;
};

export type Order = {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  lines: OrderLine[];
  totalAmount: number | null;
  currency: string | null;
};

const UNKNOWN = "necunoscut — verifică manual în Stripe";

/** Datele vin de la client (nume, adresă), deci nu ajung niciodată neescapate în HTML-ul emailului. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safe(value: string | null | undefined, fallback = "—"): string {
  return value ? escapeHtml(value) : fallback;
}

function sizeLabel(variant: Variant | undefined): string {
  return variant && SIZES.includes(variant.size) ? variant.size : UNKNOWN;
}

function colorLabel(variant: Variant | undefined): string {
  return COLORS.find((c) => c.id === variant?.color)?.label ?? UNKNOWN;
}

function formatTotal(order: Order): string {
  if (order.totalAmount == null || !order.currency) return UNKNOWN;
  return `${(order.totalAmount / 100).toFixed(2)} ${order.currency.toUpperCase()}`;
}

function shortId(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function variantRows(order: Order, borderColor: string): string {
  return order.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid ${borderColor};">${sizeLabel(line.variant)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${borderColor};">${colorLabel(line.variant)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${borderColor};">${line.quantity}</td>
      </tr>`,
    )
    .join("");
}

function tableHead(): string {
  return `
    <tr>
      <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #111;">Mărime</th>
      <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #111;">Culoare</th>
      <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #111;">Bucăți</th>
    </tr>`;
}

// --- Email 1: către producător, cu specificațiile de fabricație ---

export function buildProviderSubject(order: Order): string {
  return `Comandă nouă de producție și expediere — #${shortId(order.orderId)}`;
}

export function buildProviderHtml(order: Order): string {
  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 4px;">Comandă nouă</h2>
      <p style="margin:0 0 20px;color:#666;">Comanda #${shortId(order.orderId)} · plata încasată ${formatTotal(order)}</p>

      <h3 style="margin:0 0 8px;font-size:14px;">De produs</h3>
      <table style="border-collapse:collapse;width:100%;max-width:480px;">
        <thead>${tableHead()}</thead>
        <tbody>${variantRows(order, "#ddd")}</tbody>
      </table>

      <h3 style="margin:24px 0 8px;font-size:14px;">De expediat către</h3>
      <p style="margin:0;">${safe(order.customerName)}</p>
      <p style="margin:0;">${safe(order.shippingAddress, "adresă necompletată — verifică în Stripe")}</p>
      <p style="margin:0;color:#666;">${safe(order.customerEmail)}</p>

      <p style="margin:20px 0 0;color:#666;font-size:13px;">
        Trimite-ne numărul AWB după expediere, ca să îl putem da clientului dacă îl cere.
      </p>
    </div>`;
}

// --- Email 2: către client, confirmarea comenzii ---

export function buildCustomerSubject(order: Order): string {
  return `Comanda ta #${shortId(order.orderId)} e confirmată`;
}

export function buildCustomerHtml(order: Order): string {
  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 4px;">Mulțumim pentru comandă</h2>
      <p style="margin:0 0 20px;color:#666;">Comanda #${shortId(order.orderId)} · ${formatTotal(order)}</p>

      <p style="margin:0 0 16px;">
        Am primit plata și am trimis comanda în producție. Tricoul se confecționează și pleacă
        spre tine direct de la atelier.
      </p>

      <table style="border-collapse:collapse;width:100%;max-width:480px;">
        <thead>${tableHead()}</thead>
        <tbody>${variantRows(order, "#ddd")}</tbody>
      </table>

      <h3 style="margin:24px 0 8px;font-size:14px;">Se livrează la</h3>
      <p style="margin:0;">${safe(order.customerName)}</p>
      <p style="margin:0;">${safe(order.shippingAddress, "adresa pe care ai completat-o la plată")}</p>

      <p style="margin:24px 0 0;color:#666;font-size:13px;">
        Factura fiscală vine separat, într-un email de la SmartBill.
      </p>
      <p style="margin:8px 0 0;color:#666;font-size:13px;">
        Livrare în 2-4 zile lucrătoare. Ai 14 zile la dispoziție pentru retur, dacă produsul
        e nepurtat. Dacă ceva nu e în regulă, răspunde la acest email.
      </p>
      <p style="margin:16px 0 0;font-size:13px;">${PRODUCT.nav.brand}</p>
    </div>`;
}
