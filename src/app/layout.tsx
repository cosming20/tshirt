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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PRODUCT.name} — ${PRODUCT.nav.brand}`,
    template: `%s — ${PRODUCT.nav.brand}`,
  },
  description: PRODUCT.seoDescription,
  keywords: ["tricou", "streetwear România", "ediție limitată", PRODUCT.nav.brand],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: PRODUCT.nav.brand,
    title: `${PRODUCT.name} — ${PRODUCT.nav.brand}`,
    description: PRODUCT.seoDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT.name} — ${PRODUCT.nav.brand}`,
    description: PRODUCT.seoDescription,
  },
  robots: { index: true, follow: true },
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
