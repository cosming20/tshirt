"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DETAIL_PANELS,
  PRODUCT,
  SIZES,
  STRIPE_LINKS,
  type DetailPanel,
  type Size,
} from "@/lib/product";
import { DetailsModal } from "@/components/DetailsModal";

export function ProductExperience({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<Size>("M");
  const [openPanel, setOpenPanel] = useState<DetailPanel | null>(null);

  const checkoutHref = STRIPE_LINKS[size];

  return (
    <main className="min-h-dvh bg-panel">
      <header className="px-6 py-4 sm:px-10">
        <span className="font-display text-sm tracking-tight">
          {PRODUCT.nav.brand}
        </span>
      </header>

      <section className="grid gap-10 px-6 pb-16 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink/5">
            {images.length > 0 ? (
              <Image
                src={images[activeImage]}
                alt={PRODUCT.name}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-sm text-ink/50">
                Adaugă imagini în /public/product pentru a le vedea aici.
              </div>
            )}

            <h1 className="font-display pointer-events-none absolute left-4 top-4 max-w-[90%] text-4xl uppercase leading-[0.9] tracking-tight text-ink mix-blend-normal sm:text-6xl lg:text-7xl">
              {PRODUCT.name}
            </h1>
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-16 flex-shrink-0 overflow-hidden border-2 transition sm:h-24 sm:w-20 ${
                    i === activeImage ? "border-accent" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex max-w-md flex-col gap-6">
          <p className="text-sm leading-relaxed text-ink/80">
            {PRODUCT.description}
          </p>

          <ul className="space-y-1 text-xs font-semibold uppercase tracking-wide">
            {DETAIL_PANELS.map((panel) => (
              <li key={panel.id}>
                <button
                  type="button"
                  onClick={() => setOpenPanel(panel.id)}
                  className="text-ink/70 transition-all duration-150 hover:translate-x-1 hover:text-ink active:scale-95"
                >
                  [+] {panel.label}
                </button>
              </li>
            ))}
          </ul>

          <div>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-9 w-9 border text-xs font-semibold transition ${
                    s === size
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-ink/30 text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {!checkoutHref && (
              <p className="mt-2 text-xs text-ink/50">
                Mărimea {size} nu are încă un link de plată configurat.
              </p>
            )}
          </div>

          <p className="font-display text-3xl">{PRODUCT.price}</p>

          <a
            href={checkoutHref ?? "#"}
            target={checkoutHref ? "_blank" : undefined}
            rel={checkoutHref ? "noopener noreferrer" : undefined}
            aria-disabled={!checkoutHref}
            className={`hard-shadow inline-flex w-fit items-center justify-center bg-accent px-8 py-3 font-display text-sm uppercase tracking-wide text-accent-ink transition ${
              checkoutHref
                ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) => {
              if (!checkoutHref) e.preventDefault();
            }}
          >
            Adaugă în coș
          </a>
        </div>
      </section>

      {openPanel && (
        <DetailsModal initialPanel={openPanel} onClose={() => setOpenPanel(null)} />
      )}
    </main>
  );
}
