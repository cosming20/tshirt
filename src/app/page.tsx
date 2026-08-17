import fs from "node:fs";
import path from "node:path";
import { ProductExperience } from "@/components/ProductExperience";
import { PRODUCT, SIZES, STRIPE_LINKS } from "@/lib/product";
import { SITE_URL } from "@/lib/site";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getProductImages(): string[] {
  const dir = path.join(process.cwd(), "public", "product");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => `/product/${file}`);
}

function getProductJsonLd(images: string[]) {
  const availableSizes = SIZES.filter((s) => STRIPE_LINKS[s]);

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
