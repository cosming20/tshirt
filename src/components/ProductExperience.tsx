"use client";

import Image from "next/image";
import { useState } from "react";
import {
  COLORS,
  DETAIL_PANELS,
  PRODUCT,
  SIZES,
  STRIPE_LINKS,
  getStockStatus,
  type Color,
  type DetailPanel,
  type Size,
} from "@/lib/product";
import { DetailsModal } from "@/components/DetailsModal";

export function ProductExperience({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<Size>("M");
  const [color, setColor] = useState<Color>(COLORS[0].id);
  const [openPanel, setOpenPanel] = useState<DetailPanel | null>(null);

  const checkoutHref = STRIPE_LINKS[size][color];
  const stock = getStockStatus(size, color);
  const canBuy = Boolean(checkoutHref) && !stock.isOutOfStock;
  const colorLabel = COLORS.find((c) => c.id === color)?.label ?? color;

  return (
    <main className="min-h-dvh bg-paper">
      <header className="px-6 py-5 sm:px-10">
        <span className="font-display text-sm lowercase tracking-tight">
          {PRODUCT.nav.brand.replace(/\.\w+$/, "")}
          <span className="text-accent">{PRODUCT.nav.brand.match(/\.\w+$/)?.[0]}</span>
        </span>
      </header>

      <section className="grid gap-12 px-6 pb-20 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="animate-rise-in">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-ink/10 bg-ink">
            {images.length > 0 ? (
              <Image
                src={images[activeImage]}
                alt={`${PRODUCT.name} — fotografie produs`}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover opacity-90"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center font-mono text-sm text-paper/60">
                Adaugă imagini în /public/product pentru a le vedea aici.
              </div>
            )}

            <h1 className="font-display pointer-events-none absolute left-4 top-4 max-w-[92%] text-4xl uppercase leading-[0.92] tracking-tight text-paper drop-shadow-[2px_2px_0_rgba(13,12,17,0.6)] sm:text-6xl lg:text-7xl">
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
                  aria-label={`Vezi imaginea ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`relative h-20 w-16 flex-shrink-0 overflow-hidden border-2 transition-all duration-150 hover:-translate-y-0.5 sm:h-24 sm:w-20 ${
                    i === activeImage ? "border-accent" : "border-transparent hover:border-ink/30"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${PRODUCT.name} — imagine ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex max-w-md flex-col gap-7 animate-rise-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {PRODUCT.eyebrow}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              {PRODUCT.description}
            </p>
          </div>

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
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
              Culoare · <span className="text-ink">{colorLabel}</span>
            </p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  aria-pressed={c.id === color}
                  aria-label={c.label}
                  title={c.label}
                  className={`h-8 w-8 rounded-full border-2 transition-all duration-150 active:scale-90 ${
                    c.id === color ? "border-accent" : "border-ink/25 hover:border-ink"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
                Mărime
              </p>
              <button
                type="button"
                onClick={() => setOpenPanel("sizeGuide")}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/50 underline underline-offset-2 transition-colors hover:text-ink"
              >
                Ghid mărimi
              </button>
            </div>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  className={`h-10 w-10 border font-mono text-xs font-bold transition-all duration-150 active:scale-90 ${
                    s === size
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-ink/25 text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {!checkoutHref ? (
              <p className="mt-2 text-xs text-ink/50">
                {size} / {colorLabel} nu are încă un link de plată configurat.
              </p>
            ) : stock.isOutOfStock ? (
              <p className="mt-2 text-xs text-ink/50">
                {size} / {colorLabel} — stoc epuizat.
              </p>
            ) : stock.isLowStock ? (
              <p className="mt-2 text-xs text-accent">Au mai rămas {stock.remaining} bucăți.</p>
            ) : null}
          </div>

          <div className="flex items-end justify-between border-t border-ink/15 pt-5">
            <p className="font-display text-3xl">{PRODUCT.price}</p>

            <a
              href={canBuy ? checkoutHref : "#"}
              target={canBuy ? "_blank" : undefined}
              rel={canBuy ? "noopener noreferrer" : undefined}
              aria-disabled={!canBuy}
              className={`hard-shadow inline-flex items-center justify-center bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-accent-ink transition-all duration-150 ${
                canBuy
                  ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={(e) => {
                if (!canBuy) e.preventDefault();
              }}
            >
              {stock.isOutOfStock ? "Stoc epuizat" : "Cumpără acum"}
            </a>
          </div>
        </div>
      </section>

      {openPanel && (
        <DetailsModal initialPanel={openPanel} onClose={() => setOpenPanel(null)} />
      )}
    </main>
  );
}
