"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  COLORS,
  DETAIL_PANELS,
  PRODUCT,
  SIZE_GUIDE_PANEL,
  STORY,
  SIZES,
  getStockStatus,
  type Color,
  type Size,
} from "@/lib/product";
import { MAX_QUANTITY_PER_ITEM, cartCount, cartItemKey, type CartItem } from "@/lib/cart";
import { PanelDisclosure } from "@/components/PanelDisclosure";
import { CartModal } from "@/components/CartModal";

export function ProductExperience({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<Size>("M");
  const [color, setColor] = useState<Color>(COLORS[0].id);
  const sizeGuideRef = useRef<HTMLDetailsElement>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const stock = getStockStatus(size, color);
  const canBuy = !stock.isOutOfStock;
  const colorLabel = COLORS.find((c) => c.id === color)?.label ?? color;
  const count = cartCount(items);

  const addToCart = () => {
    const key = cartItemKey({ size, color });
    setItems((current) => {
      const existing = current.find((item) => cartItemKey(item) === key);
      if (!existing) return [...current, { size, color, quantity: 1 }];
      // Aceeași variantă adăugată din nou crește cantitatea, până la plafonul acceptat de server.
      return current.map((item) =>
        cartItemKey(item) === key
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY_PER_ITEM) }
          : item,
      );
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const changeQuantity = (target: CartItem, quantity: number) =>
    setItems((current) =>
      current.map((item) =>
        cartItemKey(item) === cartItemKey(target) ? { ...item, quantity } : item,
      ),
    );

  const removeItem = (target: CartItem) =>
    setItems((current) =>
      current.filter((item) => cartItemKey(item) !== cartItemKey(target)),
    );

  // Ghidul de mărimi trăiește ca <details> propriu, lângă selectorul de mărime (vezi mai
  // jos) — linkul doar îl deschide și îl aduce în vizor, nu (mai) declanșează un modal.
  const openSizeGuide = () => {
    const el = sizeGuideRef.current;
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-paper">
      <header className="flex flex-shrink-0 items-center justify-between px-[clamp(1rem,4vw,2.5rem)] py-[clamp(0.55rem,1.6vh,1.1rem)]">
        <span className="font-display text-[clamp(0.75rem,1.6vw,0.95rem)] lowercase tracking-tight">
          {PRODUCT.nav.brand.replace(/\.\w+$/, "")}
          <span className="text-accent">{PRODUCT.nav.brand.match(/\.\w+$/)?.[0]}</span>
        </span>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
        >
          Coș ({count})
        </button>
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

        {/* Derulare internă: povestea completă stă aici, iar pe ecrane scunde nu trebuie să
            împingă prețul și butonul în afara viewportului. */}
        <div
          className="flex w-full min-h-0 flex-shrink-0 flex-col justify-center gap-[clamp(0.45rem,1.6vh,1.25rem)] overflow-y-auto animate-rise-in landscape:h-full landscape:max-w-md landscape:flex-1"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-col gap-[clamp(0.35rem,0.9vh,0.75rem)]">
            <p className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.2em] text-accent">
              {PRODUCT.eyebrow}
            </p>

            <p className="text-[clamp(0.75rem,1.35vw,0.9375rem)] font-medium leading-snug text-ink">
              {STORY.lead}
            </p>

            {STORY.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-[clamp(0.7rem,1.25vw,0.8125rem)] leading-relaxed text-ink/70"
              >
                {paragraph}
              </p>
            ))}

            <p className="font-mono text-[clamp(0.55rem,1.05vw,0.6875rem)] uppercase leading-relaxed tracking-[0.1em] text-ink">
              {STORY.closer}
            </p>
          </div>

          <ul className="hidden gap-1.5 text-[clamp(0.6rem,1.1vw,0.75rem)] font-semibold uppercase tracking-wide [@media(min-height:600px)]:flex [@media(min-height:600px)]:flex-col">
            {DETAIL_PANELS.map((panel) => (
              <li key={panel.id}>
                <PanelDisclosure panel={panel} />
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
                onClick={openSizeGuide}
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
            {stock.isOutOfStock ? (
              <p className="mt-2 line-clamp-1 text-[clamp(0.6rem,1.1vw,0.75rem)] text-ink/50">
                {size} / {colorLabel} — stoc epuizat.
              </p>
            ) : stock.isLowStock ? (
              <p className="mt-2 line-clamp-1 text-[clamp(0.6rem,1.1vw,0.75rem)] text-accent">
                Au mai rămas {stock.remaining} bucăți.
              </p>
            ) : null}

            <div className="mt-2 text-[clamp(0.6rem,1.1vw,0.75rem)] font-semibold uppercase tracking-wide">
              <PanelDisclosure panel={SIZE_GUIDE_PANEL} detailsRef={sizeGuideRef} />
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-ink/15 pt-[clamp(0.6rem,1.6vh,1.25rem)]">
            <div>
              {/* Fără eticheta asta, un extractor de conținut vede un număr gol lângă un
                  buton — nimic care să-i spună că e prețul. */}
              <p className="font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.15em] text-ink/50">
                Preț
              </p>
              <p className="font-display text-[clamp(1.25rem,3vw,1.875rem)]">{PRODUCT.price}</p>
            </div>

            <button
              type="button"
              onClick={addToCart}
              disabled={!canBuy}
              className={`hard-shadow inline-flex items-center justify-center bg-accent px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.55rem,1.5vh,0.875rem)] font-display text-[clamp(0.7rem,1.3vw,0.875rem)] uppercase tracking-wide text-accent-ink transition-all duration-150 ${
                canBuy
                  ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              {stock.isOutOfStock ? "Stoc epuizat" : justAdded ? "Adăugat ✓" : "Adaugă în coș"}
            </button>
          </div>

          {count > 0 && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-fit font-mono text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.14em] text-ink/55 underline underline-offset-4 transition-colors hover:text-ink"
            >
              Vezi coșul ({count}) și finalizează →
            </button>
          )}
        </div>
      </section>

      {isCartOpen && (
        <CartModal
          items={items}
          onChangeQuantity={changeQuantity}
          onRemove={removeItem}
          onClose={() => setCartOpen(false)}
        />
      )}
    </main>
  );
}
