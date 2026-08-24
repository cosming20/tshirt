export const ROMANIAN_COUNTIES = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "București",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "Iași",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
] as const;

export type RomanianCounty = (typeof ROMANIAN_COUNTIES)[number];

export type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  county: RomanianCounty;
  postalCode: string;
};

const COUNTIES = new Set<string>(ROMANIAN_COUNTIES);
const MAX_NAME = 80;
const MAX_LINE = 120;
const MAX_CITY = 60;

export const SHIPPING_META = {
  name: "ship_name",
  phone: "ship_phone",
  line1: "ship_line1",
  line2: "ship_line2",
  city: "ship_city",
  county: "ship_county",
  postal: "ship_postal",
} as const;

function trimField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const compact = value.replace(/[\s().-]/g, "");
  if (/^07\d{8}$/.test(compact)) return compact;
  if (/^\+407\d{8}$/.test(compact)) return `0${compact.slice(3)}`;
  if (/^00407\d{8}$/.test(compact)) return `0${compact.slice(4)}`;
  return null;
}

function parsePostalCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const compact = value.replace(/\s/g, "");
  return /^\d{6}$/.test(compact) ? compact : null;
}

function parseCounty(value: unknown): RomanianCounty | null {
  if (typeof value !== "string") return null;
  return COUNTIES.has(value) ? (value as RomanianCounty) : null;
}

export function parseShippingAddress(value: unknown): ShippingAddress | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const fullName = trimField(raw.fullName, MAX_NAME);
  const phone = normalizePhone(raw.phone);
  const line1 = trimField(raw.line1, MAX_LINE);
  const city = trimField(raw.city, MAX_CITY);
  const county = parseCounty(raw.county);
  const postalCode = parsePostalCode(raw.postalCode);

  if (!fullName || !phone || !line1 || !city || !county || !postalCode) return null;
  if (!/[a-zăâîșț]/i.test(fullName)) return null;

  const line2Raw = typeof raw.line2 === "string" ? raw.line2.trim() : "";
  if (line2Raw.length > MAX_LINE) return null;

  return {
    fullName,
    phone,
    line1,
    line2: line2Raw.length > 0 ? line2Raw : null,
    city,
    county,
    postalCode,
  };
}

export function formatShippingAddress(shipping: ShippingAddress): string {
  const street = [shipping.line1, shipping.line2].filter(Boolean).join(", ");
  return [street, shipping.postalCode, shipping.city, shipping.county, "RO"].join(", ");
}

export function shippingToMetadata(shipping: ShippingAddress): Record<string, string> {
  const metadata: Record<string, string> = {
    [SHIPPING_META.name]: shipping.fullName,
    [SHIPPING_META.phone]: shipping.phone,
    [SHIPPING_META.line1]: shipping.line1,
    [SHIPPING_META.city]: shipping.city,
    [SHIPPING_META.county]: shipping.county,
    [SHIPPING_META.postal]: shipping.postalCode,
  };
  if (shipping.line2) metadata[SHIPPING_META.line2] = shipping.line2;
  return metadata;
}

export function shippingFromMetadata(
  metadata: Record<string, string> | null | undefined,
): ShippingAddress | null {
  if (!metadata) return null;
  return parseShippingAddress({
    fullName: metadata[SHIPPING_META.name],
    phone: metadata[SHIPPING_META.phone],
    line1: metadata[SHIPPING_META.line1],
    line2: metadata[SHIPPING_META.line2] ?? "",
    city: metadata[SHIPPING_META.city],
    county: metadata[SHIPPING_META.county],
    postalCode: metadata[SHIPPING_META.postal],
  });
}
