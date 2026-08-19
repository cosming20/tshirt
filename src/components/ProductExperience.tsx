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
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-paper">
      <header className="flex-shrink-0 px-[clamp(1rem,4vw,2.5rem)] py-[clamp(0.55rem,1.6vh,1.1rem)]">
        <span className="font-display text-[clamp(0.75rem,1.6vw,0.95rem)] lowercase tracking-tight">
          {PRODUCT.nav.brand.replace(/\.\w+$/, "")}
          <span className="text-accent">{PRODUCT.nav.brand.match(/\.\w+$/)?.[0]}</span>
        </span>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-[clamp(0.6rem,1.8vh,1.5rem)] overflow-hidden px-[clamp(1rem,4vw,2.5rem)] pb-[clamp(0.6rem,1.8vh,1.5rem)] landscape:flex-row landscape:items-stretch landscape:gap-[clamp(1rem,3vw,4rem)]">
        <div className="flex min-h-0 flex-1 flex-col gap-[clamp(0.4rem,1.2vh,0.75rem)] animate-rise-in landscape:flex-[1.15]">
          <div className="relative min-h-0 flex-1 overflow-hidden border border-ink/10 bg-ink">
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

            <h1 className="font-display pointer-events-none absolute left-[clamp(0.75rem,2vw,1.5rem)] top-[clamp(0.6rem,2vh,1.5rem)] max-w-[92%] text-[clamp(1.5rem,6vw,4.5rem)] uppercase leading-[0.92] tracking-tight text-paper drop-shadow-[2px_2px_0_rgba(13,12,17,0.6)]">
              {PRODUCT.name}
            </h1>
          </div>

          {images.length > 1 && (
            <div className="hidden flex-shrink-0 gap-[clamp(0.4rem,1vw,0.75rem)] overflow-x-auto pb-1 [@media(min-height:560px)]:flex">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Vezi imaginea ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`relative aspect-[4/5] h-[clamp(2.75rem,7vh,5.5rem)] flex-shrink-0 overflow-hidden border-2 transition-all duration-150 hover:-translate-y-0.5 ${
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
          className="flex w-full flex-shrink-0 flex-col justify-center gap-[clamp(0.45rem,1.6vh,1.25rem)] animate-rise-in landscape:h-full landscape:max-w-md landscape:flex-1"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <p className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.2em] text-accent">
              {PRODUCT.eyebrow}
            </p>
            <p className="mt-[clamp(0.3rem,0.8vh,0.75rem)] line-clamp-3 text-[clamp(0.7rem,1.3vw,0.875rem)] leading-relaxed text-ink/75">
              {PRODUCT.description}
            </p>
            {/* Hero-ul umple tot ecranul, deci fără indiciul ăsta nimeni n-ar afla că povestea urmează. */}
            <a
              href="#poveste"
              className="mt-[clamp(0.35rem,0.9vh,0.75rem)] inline-block font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.14em] text-ink/50 underline underline-offset-4 transition-colors hover:text-ink"
            >
              Citește povestea ↓
            </a>
          </div>

          <ul className="hidden gap-1 text-[clamp(0.6rem,1.1vw,0.75rem)] font-semibold uppercase tracking-wide [@media(min-height:600px)]:flex [@media(min-height:600px)]:flex-col">
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
            <p className="mb-[clamp(0.3rem,0.8vh,0.5rem)] font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.15em] text-ink/50">
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
                  className={`h-[clamp(1.6rem,4vh,2rem)] w-[clamp(1.6rem,4vh,2rem)] rounded-full border-2 transition-all duration-150 active:scale-90 ${
                    c.id === color ? "border-accent" : "border-ink/25 hover:border-ink"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-[clamp(0.3rem,0.8vh,0.5rem)] flex items-center justify-between">
              <p className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.15em] text-ink/50">
                Mărime
              </p>
              <button
                type="button"
                onClick={() => setOpenPanel("sizeGuide")}
                className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.1em] text-ink/50 underline underline-offset-2 transition-colors hover:text-ink"
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
                  className={`h-[clamp(1.9rem,4.5vh,2.5rem)] w-[clamp(1.9rem,4.5vh,2.5rem)] border font-mono text-xs font-bold transition-all duration-150 active:scale-90 ${
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
              <p className="mt-2 line-clamp-1 text-[clamp(0.6rem,1.1vw,0.75rem)] text-ink/50">
                {size} / {colorLabel} nu are încă un link de plată configurat.
              </p>
            ) : stock.isOutOfStock ? (
              <p className="mt-2 line-clamp-1 text-[clamp(0.6rem,1.1vw,0.75rem)] text-ink/50">
                {size} / {colorLabel} — stoc epuizat.
              </p>
            ) : stock.isLowStock ? (
              <p className="mt-2 line-clamp-1 text-[clamp(0.6rem,1.1vw,0.75rem)] text-accent">
                Au mai rămas {stock.remaining} bucăți.
              </p>
            ) : null}
          </div>

          <div className="flex items-end justify-between border-t border-ink/15 pt-[clamp(0.6rem,1.6vh,1.25rem)]">
            <p className="font-display text-[clamp(1.25rem,3vw,1.875rem)]">{PRODUCT.price}</p>

            <a
              href={canBuy ? checkoutHref : "#"}
              target={canBuy ? "_blank" : undefined}
              rel={canBuy ? "noopener noreferrer" : undefined}
              aria-disabled={!canBuy}
              className={`hard-shadow inline-flex items-center justify-center bg-accent px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.55rem,1.5vh,0.875rem)] font-display text-[clamp(0.7rem,1.3vw,0.875rem)] uppercase tracking-wide text-accent-ink transition-all duration-150 ${
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
