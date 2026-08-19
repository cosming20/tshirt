import { cmToInches } from "@/lib/units";

export type Size = "S" | "M" | "L" | "XL" | "XXL";
export type Color = "negru" | "alb";

export const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

export const COLORS: { id: Color; label: string; swatch: string }[] = [
  { id: "negru", label: "Negru", swatch: "#0d0c11" },
  { id: "alb", label: "Alb", swatch: "#f4f2ec" },
];

/**
 * Fiecare combinație mărime+culoare e o variantă distinctă în Stripe: un singur
 * produs cu 10 prețuri, fiecare cu propriul Payment Link. Culoarea e deja
 * fixată de link, deci clientul o alege o singură dată — pe site — și nu mai
 * poate apărea o nepotrivire între ce a ales și ce se produce.
 * Completează linkurile în .env.local (vezi .env.local.example).
 */
export const STRIPE_LINKS: Record<Size, Record<Color, string | undefined>> = {
  S: {
    negru: process.env.NEXT_PUBLIC_STRIPE_LINK_S_NEGRU,
    alb: process.env.NEXT_PUBLIC_STRIPE_LINK_S_ALB,
  },
  M: {
    negru: process.env.NEXT_PUBLIC_STRIPE_LINK_M_NEGRU,
    alb: process.env.NEXT_PUBLIC_STRIPE_LINK_M_ALB,
  },
  L: {
    negru: process.env.NEXT_PUBLIC_STRIPE_LINK_L_NEGRU,
    alb: process.env.NEXT_PUBLIC_STRIPE_LINK_L_ALB,
  },
  XL: {
    negru: process.env.NEXT_PUBLIC_STRIPE_LINK_XL_NEGRU,
    alb: process.env.NEXT_PUBLIC_STRIPE_LINK_XL_ALB,
  },
  XXL: {
    negru: process.env.NEXT_PUBLIC_STRIPE_LINK_XXL_NEGRU,
    alb: process.env.NEXT_PUBLIC_STRIPE_LINK_XXL_ALB,
  },
};

/**
 * Stoc actualizat manual de tine după fiecare comandă/reaprovizionare — nu
 * există bază de date, deci numerele astea nu scad automat la o vânzare.
 * Pragul sub care arătăm "mai sunt puține" pe pagină.
 */
const LOW_STOCK_THRESHOLD = 3;

export const STOCK: Record<Size, Record<Color, number>> = {
  S: { negru: 5, alb: 5 },
  M: { negru: 5, alb: 5 },
  L: { negru: 5, alb: 5 },
  XL: { negru: 5, alb: 5 },
  XXL: { negru: 5, alb: 5 },
};

export function getStockStatus(size: Size, color: Color) {
  const remaining = STOCK[size][color];
  return {
    remaining,
    isOutOfStock: remaining <= 0,
    isLowStock: remaining > 0 && remaining <= LOW_STOCK_THRESHOLD,
  };
}

export const PRODUCT = {
  name: "NUMELE TRICOULUI TĂU",
  eyebrow: "UN SINGUR TRICOU. FĂRĂ ALTCEVA.",
  price: "150 RON",
  /** Preț numeric + valută ISO, folosite în datele structurate pentru SEO (nu afișate direct). */
  priceAmount: 150,
  currency: "RON",
  description:
    "Descriere scurtă a produsului — materiale, croială, print. Editează în src/lib/product.ts.",
  /** O propoziție scurtă pentru <meta description> și pentru cardurile de share. */
  seoDescription:
    "Un singur tricou, o singură ediție. Comandă direct, plata se procesează securizat prin Stripe.",
  nav: {
    brand: "tricouamenda.ro",
  },
};

export type DetailPanel = "care" | "details" | "shipping" | "sizeGuide";

export type PanelContent =
  | { kind: "list"; items: string[] }
  | { kind: "table"; columns: string[]; rows: string[][]; note?: string };

export type Panel = { id: DetailPanel; label: string; content: PanelContent };

/** Cele 3 panouri afișate ca linkuri sub descriere. Ghidul de mărimi are propriul link, lângă selectorul de mărime. */
export const DETAIL_PANELS: Panel[] = [
  {
    id: "care",
    label: "ÎNGRIJIRE",
    content: {
      kind: "list",
      items: [
        "Toate produsele sunt prespălate pentru a nu se mai contracta.",
        "Spală la rece, pe dos.",
        "Nu călca direct pe print.",
        "Nu usca la uscător.",
      ],
    },
  },
  {
    id: "details",
    label: "DETALII PRODUS",
    content: {
      kind: "list",
      items: [
        "100% bumbac, ~205 g/m².",
        "Croială clasică, fără cusături laterale.",
        "Print digital DTG (Direct-to-Garment), nu serigrafie.",
        "Confecționat în România.",
      ],
    },
  },
  {
    id: "shipping",
    label: "LIVRARE ȘI RETURUR",
    content: {
      kind: "list",
      items: [
        "Livrare în 2-4 zile lucrătoare prin curier.",
        "Retur gratuit în 14 zile de la primire, produs nepurtat.",
        "Plata se procesează securizat prin Stripe.",
      ],
    },
  },
];

/** Măsurători de la producător (tricou întins pe masă), în cm. Lățime = la 1cm sub subraț; lungime = de la umăr la tiv. */
const SIZE_CHART_CM: Record<Size, { widthCm: number; lengthCm: number }> = {
  S: { widthCm: 48.5, lengthCm: 69.5 },
  M: { widthCm: 53.5, lengthCm: 72 },
  L: { widthCm: 56, lengthCm: 74.5 },
  XL: { widthCm: 61, lengthCm: 77 },
  XXL: { widthCm: 66, lengthCm: 78.5 },
};
export const SIZE_CHART_TOLERANCE_CM = 2.5;

export const SIZE_GUIDE_PANEL: Panel = {
  id: "sizeGuide",
  label: "GHID MĂRIMI",
  content: {
    kind: "table",
    columns: ["Mărime", "Lățime (cm / in)", "Lungime (cm / in)"],
    rows: SIZES.map((s) => {
      const { widthCm, lengthCm } = SIZE_CHART_CM[s];
      return [
        s,
        `${widthCm} / ${cmToInches(widthCm)}"`,
        `${lengthCm} / ${cmToInches(lengthCm)}"`,
      ];
    }),
    note: `Lățimea se măsoară pe orizontală, la 1cm sub subraț; lungimea de la punctul cel mai înalt al umărului până la tiv. Toleranță ±${SIZE_CHART_TOLERANCE_CM}cm.`,
  },
};

export const ALL_PANELS: Panel[] = [...DETAIL_PANELS, SIZE_GUIDE_PANEL];
