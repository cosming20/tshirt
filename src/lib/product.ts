export type Size = "S" | "M" | "L" | "XL" | "XXL";

export const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

/**
 * Fiecare mărime are propriul Stripe Payment Link (produsul din Stripe poate
 * fi acelasi, dar fiecare mărime = un Payment Link separat, cel mai simplu
 * mod de a gestiona variante fără cod custom pe partea de checkout).
 * Completează linkurile în .env.local (vezi .env.local.example).
 */
export const STRIPE_LINKS: Record<Size, string | undefined> = {
  S: process.env.NEXT_PUBLIC_STRIPE_LINK_S,
  M: process.env.NEXT_PUBLIC_STRIPE_LINK_M,
  L: process.env.NEXT_PUBLIC_STRIPE_LINK_L,
  XL: process.env.NEXT_PUBLIC_STRIPE_LINK_XL,
  XXL: process.env.NEXT_PUBLIC_STRIPE_LINK_XXL,
};

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
    brand: "GUTA TRICOU",
  },
};

export type DetailPanel = "care" | "details" | "shipping";

export const DETAIL_PANELS: {
  id: DetailPanel;
  label: string;
  content: string[];
}[] = [
  {
    id: "care",
    label: "ÎNGRIJIRE",
    content: [
      "Toate produsele sunt prespălate pentru a nu se mai contracta.",
      "Spală la rece, pe dos.",
      "Nu călca direct pe print.",
      "Nu usca la uscător.",
    ],
  },
  {
    id: "details",
    label: "DETALII PRODUS",
    content: [
      "100% bumbac, 220g/m².",
      "Croială oversized, unisex.",
      "Print serigrafic pe piept și spate.",
      "Fabricat și tipărit în România.",
    ],
  },
  {
    id: "shipping",
    label: "LIVRARE ȘI RETURUR",
    content: [
      "Livrare în 2-4 zile lucrătoare prin curier.",
      "Retur gratuit în 14 zile de la primire, produs nepurtat.",
      "Plata se procesează securizat prin Stripe.",
    ],
  },
];
