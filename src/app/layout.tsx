import type { Metadata } from "next";
import { Hanken_Grotesk, Space_Mono, Unbounded } from "next/font/google";
import { PRODUCT } from "@/lib/product";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  weight: ["700", "900"],
  subsets: ["latin", "latin-ext"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Include termenii de categorie ("tricou", "limited drop") pe lângă numele produsului,
// ca titlul să prindă și căutări de la oameni care nu știu încă de brand — vezi
// docs/seo-research.md, secțiunea 4a, opțiunea recomandată.
const TITLE = `${PRODUCT.name} — Tricou Limited Drop | ${PRODUCT.nav.brand}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${PRODUCT.nav.brand}`,
  },
  description: PRODUCT.seoDescription,
  keywords: [
    "tricou amendat pentru artă",
    "tricou cu mesaj",
    "streetwear românesc",
    "tricou ediție limitată",
    "tricou limited drop",
    PRODUCT.nav.brand,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: PRODUCT.nav.brand,
    title: TITLE,
    description: PRODUCT.seoDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: PRODUCT.seoDescription,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "hDbSL5M29sZMYk2_jt_yt0Jasdk5rzC0eKLnQfTN9uY",
  },
};

export const viewport = {
  themeColor: "#0d0c11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
