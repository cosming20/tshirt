import fs from "node:fs";
import path from "node:path";
import { ProductExperience } from "@/components/ProductExperience";
import { SiteFooter } from "@/components/SiteFooter";
import { MANUFACTURER, RETURNS, SELLER } from "@/lib/legal";
import { COLORS, PRODUCT, SIZES, getStockStatus } from "@/lib/product";
import { LAST_CONTENT_UPDATE, SITE_URL } from "@/lib/site";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
/** Cât timp rămâne valid prețul din datele structurate înainte să trebuiască regenerat. */
const PRICE_VALID_MONTHS = 6;

/**
 * Identificatori stabili pentru nodurile din `@graph`. Fără ei, un motor vede patru
 * entități fără legătură între ele; cu ei, „produsul ăsta e vândut de firma asta, pe
 * site-ul ăsta” e o singură afirmație pe care o poate cita ca atare.
 */
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;
const PRODUCT_ID = `${SITE_URL}/#product`;

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
      const isSellable = !getStockStatus(size, color.id).isOutOfStock;

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
    "@type": "Product",
    "@id": PRODUCT_ID,
    name: PRODUCT.name,
    description: PRODUCT.seoDescription,
    image: images.map((img) => `${SITE_URL}${img}`),
    brand: { "@type": "Brand", name: PRODUCT.nav.brand },
    // Doar atribute care apar și în panourile vizibile de pe pagină — datele
    // structurate care nu se regăsesc în conținut sunt ignorate, în cel mai bun caz.
    material: "100% bumbac",
    countryOfOrigin: { "@type": "Country", name: "România" },
    manufacturer: { "@type": "Organization", name: MANUFACTURER.name },
    mainEntityOfPage: { "@id": WEBPAGE_ID },
    offers,
  };
}

/**
 * Vânzătorul real, nu brandul de pe tricou: entitatea juridică din footer, cu aceleași
 * identificatori pe care i-ar verifica un om (CUI, Reg. Com.). Politica de retur stă
 * aici, la nivel de organizație, nu pe fiecare Offer — se aplică identic tuturor
 * variantelor, iar în felul ăsta logica de stoc de mai sus rămâne neatinsă.
 */
function getOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SELLER.name,
    legalName: SELLER.name,
    url: SITE_URL,
    email: SELLER.email,
    vatID: SELLER.cui,
    identifier: [
      {
        "@type": "PropertyValue",
        name: "Registrul Comerțului",
        value: SELLER.regCom,
      },
    ],
    areaServed: { "@type": "Country", name: "România" },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "RO",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: RETURNS.windowDays,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };
}

function getWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: PRODUCT.nav.brand,
    inLanguage: "ro-RO",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Nodul care poartă data. Perplexity și celelalte motoare cu bias de prospețime caută
 * un semnal explicit de „când a fost actualizat asta ultima oară”; site-ul nu afișează
 * o dată vizibilă, deci `LAST_CONTENT_UPDATE` (întreținută manual, aceeași folosită în
 * sitemap) e singura sursă onestă. Dacă e lăsată să se învechească, minte — de asta
 * trăiește într-un singur loc.
 */
function getWebPageJsonLd() {
  return {
    "@type": "WebPage",
    "@id": WEBPAGE_ID,
    url: `${SITE_URL}/`,
    name: `${PRODUCT.name} — ${PRODUCT.nav.brand}`,
    description: PRODUCT.seoDescription,
    inLanguage: "ro-RO",
    dateModified: LAST_CONTENT_UPDATE,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PRODUCT_ID },
  };
}

function getJsonLdGraph(images: string[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationJsonLd(),
      getWebSiteJsonLd(),
      getWebPageJsonLd(),
      getProductJsonLd(images),
    ],
  };
}

export default function Home() {
  const images = getProductImages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLdGraph(images)) }}
      />
      <ProductExperience images={images} />
      <SiteFooter />
    </>
  );
}
