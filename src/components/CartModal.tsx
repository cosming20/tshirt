"use client";

import { useEffect, useState } from "react";
import { MAX_QUANTITY_PER_ITEM, cartCount, cartItemKey, type CartItem } from "@/lib/cart";
import { COLORS, PRODUCT } from "@/lib/product";

const CLOSE_ANIMATION_MS = 180;

function colorLabel(id: string): string {
  return COLORS.find((c) => c.id === id)?.label ?? id;
}

export function CartModal({
  items,
  onChangeQuantity,
  onRemove,
  onClose,
}: {
  items: CartItem[];
  onChangeQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, CLOSE_ANIMATION_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cartCount(items) * PRODUCT.priceAmount;

  const checkout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(items),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Nu am putut porni plata. Încearcă din nou.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Verifică conexiunea și încearcă din nou.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
        closing ? "opacity-0" : "animate-[fade-in_0.2s_ease-out]"
      }`}
      onClick={requestClose}
    >
      <div
        className={`hard-shadow flex max-h-[85vh] w-full max-w-lg flex-col border border-ink bg-paper transition-all duration-200 ease-out ${
          closing
            ? "translate-y-1 scale-[0.97] opacity-0"
            : "animate-[modal-in_0.28s_cubic-bezier(0.16,1,0.3,1)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/20 p-6 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-tight">Coș</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Închide"
            className="text-2xl leading-none text-ink/70 transition-transform duration-150 hover:scale-110 hover:text-ink active:scale-90"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-sm text-ink/60">
              Coșul e gol. Alege o mărime și o culoare, apoi adaugă în coș.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={cartItemKey(item)} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold uppercase">
                      {item.size} · {colorLabel(item.color)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(item)}
                      className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45 underline underline-offset-2 transition-colors hover:text-ink"
                    >
                      Șterge
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`qty-${cartItemKey(item)}`}>
                      Cantitate {item.size} {colorLabel(item.color)}
                    </label>
                    <select
                      id={`qty-${cartItemKey(item)}`}
                      value={item.quantity}
                      onChange={(e) => onChangeQuantity(item, Number(e.target.value))}
                      className="h-9 border border-ink/25 bg-paper px-2 font-mono text-xs transition-colors hover:border-ink"
                    >
                      {Array.from({ length: MAX_QUANTITY_PER_ITEM }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span className="w-20 text-right font-mono text-sm tabular-nums">
                      {item.quantity * PRODUCT.priceAmount} {PRODUCT.currency}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-ink/20 p-6">
            {error && <p className="text-sm text-accent">{error}</p>}

            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
                Total
              </span>
              <span className="font-display text-2xl tabular-nums">
                {total} {PRODUCT.currency}
              </span>
            </div>

            <button
              type="button"
              onClick={checkout}
              disabled={isSubmitting}
              className={`hard-shadow inline-flex items-center justify-center bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-accent-ink transition-all duration-150 ${
                isSubmitting
                  ? "cursor-wait opacity-60"
                  : "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
              }`}
            >
              {isSubmitting ? "Se deschide plata…" : "Finalizează comanda"}
            </button>

            <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
              Livrarea se calculează la plată
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
