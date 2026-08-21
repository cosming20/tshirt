import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT } from "@/lib/product";

export const metadata: Metadata = {
  title: "Comandă confirmată",
  robots: { index: false, follow: false },
};

export default function OrderConfirmed() {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-[clamp(1rem,4vw,2.5rem)] py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          Plata a fost primită
        </p>

        <h1 className="font-display text-[clamp(1.75rem,5vw,3rem)] uppercase leading-[1.05] tracking-tight text-balance">
          Ți-am primit comanda
        </h1>

        <p className="max-w-[52ch] leading-relaxed text-ink/75">
          Ai primit un email de confirmare. Tricoul intră în producție și pleacă spre tine
          direct de la atelier. Factura vine separat.
        </p>

        <Link
          href="/"
          className="hard-shadow mt-2 inline-flex w-fit items-center justify-center bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-accent-ink transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Înapoi la magazin
        </Link>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
          {PRODUCT.nav.brand}
        </p>
      </div>
    </main>
  );
}
