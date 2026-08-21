import { COLORS, SIZES, type Color, type Size } from "@/lib/product";

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

/** Preț per variantă, luat din configurația serverului — niciodată din request-ul clientului. */
export function resolvePriceIdForVariant(variant: Variant): string | undefined {
  const entry = Object.entries(PRICE_ID_TO_VARIANT).find(
    ([priceId, mapped]) =>
      priceId !== "" && mapped?.size === variant.size && mapped?.color === variant.color,
  );
  return entry?.[0];
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
  return `Ți-am primit comanda #${shortId(order.orderId)}`;
}

/** Culorile site-ului, inline — clienții de email ignoră stylesheet-urile externe. */
const MAIL_PAPER = "#f4f2ec";
const MAIL_INK = "#0d0c11";
const MAIL_ACCENT = "#5a31f4";

export function buildCustomerHtml(order: Order): string {
  return `
    <div style="margin:0;padding:32px 16px;background:${MAIL_PAPER};font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:440px;margin:0 auto;background:${MAIL_PAPER};color:${MAIL_INK};">

        <p style="margin:0 0 28px;font-size:12px;letter-spacing:0.08em;text-transform:lowercase;">
          tricouamenda<span style="color:${MAIL_ACCENT};">.ro</span>
        </p>

        <h1 style="margin:0 0 12px;font-size:26px;line-height:1.15;text-transform:uppercase;letter-spacing:-0.5px;">
          Ți-am primit comanda
        </h1>

        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
          Mulțumim. Revenim cu detalii despre livrare.
        </p>

        <p style="margin:0;padding-top:20px;border-top:1px solid rgba(13,12,17,0.15);font-family:'Courier New',monospace;font-size:12px;letter-spacing:0.06em;color:rgba(13,12,17,0.55);">
          Comanda #${shortId(order.orderId)}
        </p>

      </div>
    </div>`;
}
