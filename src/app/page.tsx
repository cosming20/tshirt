import fs from "node:fs";
import path from "node:path";
import { ProductExperience } from "@/components/ProductExperience";
import { COLORS, PRODUCT, SIZES, STRIPE_LINKS, getStockStatus } from "@/lib/product";
import { SITE_URL } from "@/lib/site";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
/** Cât timp rămâne valid prețul din datele structurate înainte să trebuiască regenerat. */
const PRICE_VALID_MONTHS = 6;

function getProductImages(): string[] {
  const dir = path.join(process.cwd(), "public", "product");
  if (!fs.existsSync(dir)) return [];

  const images = fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => `/product/${file}`);

  if (images.length === 0) {
    console.warn(
      "[seo] public/product/ nu are nicio imagine — Product JSON-LD va publica image: [], ceea ce încalcă cerințele Google pentru rich results. Adaugă poze înainte de deploy.",
    );
  }

  return images;
}

function getProductJsonLd(images: string[]) {
  const priceValidUntil = new Date();
  priceValidUntil.setMonth(priceValidUntil.getMonth() + PRICE_VALID_MONTHS);
  const validUntil = priceValidUntil.toISOString().slice(0, 10);

  // Câte un Offer per variantă, ca disponibilitatea să fie reală per mărime+culoare,
  // nu un singur "în stoc" care ascunde variantele epuizate.
  const offers = SIZES.flatMap((size) =>
    COLORS.map((color) => {
      const isSellable =
        Boolean(STRIPE_LINKS[size][color.id]) && !getStockStatus(size, color.id).isOutOfStock;

      return {
        "@type": "Offer",
        name: `${PRODUCT.name} — ${size}, ${color.label}`,
        url: SITE_URL,
        priceCurrency: PRODUCT.currency,
        price: PRODUCT.priceAmount,
        priceValidUntil: validUntil,
        availability: isSellable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      };
    }),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT.name,
    description: PRODUCT.seoDescription,
    image: images.map((img) => `${SITE_URL}${img}`),
    brand: { "@type": "Brand", name: PRODUCT.nav.brand },
    offers,
  };
}

export default function Home() {
  const images = getProductImages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(images)) }}
      />
      <ProductExperience images={images} />
    </>
  );
}
