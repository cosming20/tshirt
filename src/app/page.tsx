import fs from "node:fs";
import path from "node:path";
import { ProductExperience } from "@/components/ProductExperience";
import { PRODUCT, SIZES, STRIPE_LINKS } from "@/lib/product";
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
  const availableSizes = SIZES.filter((s) => STRIPE_LINKS[s]);
  const priceValidUntil = new Date();
  priceValidUntil.setMonth(priceValidUntil.getMonth() + PRICE_VALID_MONTHS);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT.name,
    description: PRODUCT.seoDescription,
    image: images.map((img) => `${SITE_URL}${img}`),
    brand: { "@type": "Brand", name: PRODUCT.nav.brand },
    offers: {
      "@type": "Offer",
      url: SITE_URL,
      priceCurrency: PRODUCT.currency,
      price: PRODUCT.priceAmount,
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      availability:
        availableSizes.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
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
