"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MAX_QUANTITY_PER_ITEM, cartCount, cartItemKey, type CartItem } from "@/lib/cart";
import { COLORS, PRODUCT } from "@/lib/product";
import { ROMANIAN_COUNTIES, parseShippingAddress } from "@/lib/shipping";

const CLOSE_ANIMATION_MS = 180;

const EMPTY_SHIPPING = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  county: "",
  postalCode: "",
};

function colorLabel(id: string): string {
  return COLORS.find((c) => c.id === id)?.label ?? id;
}

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
  inputMode,
  type = "text",
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: "tel" | "numeric" | "text";
  type?: "text" | "email" | "tel";
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
        {label}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border border-ink/25 bg-paper px-3 font-mono text-sm outline-none transition-colors hover:border-ink focus:border-ink"
      />
    </label>
  );
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
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState(EMPTY_SHIPPING);

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
  const view = items.length === 0 ? "cart" : step;
  const setField = (key: keyof typeof EMPTY_SHIPPING, value: string) =>
    setShipping((current) => ({ ...current, [key]: value }));

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseShippingAddress(shipping);
    if (!parsed) {
      setError("Verifică numele, telefonul (07xxxxxxxx) și adresa.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items, shipping: parsed }),
      });
      const data: unknown = await res.json();
      const url =
        typeof data === "object" && data !== null && "url" in data && typeof data.url === "string"
          ? data.url
          : null;
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "Nu am putut porni plata. Încearcă din nou.";
      if (!res.ok || !url) {
        setError(message);
        setSubmitting(false);
        return;
      }
      window.location.href = url;
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
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {view === "cart" ? "Coș" : "Livrare"}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Închide"
            className="text-2xl leading-none text-ink/70 transition-transform duration-150 hover:scale-110 hover:text-ink active:scale-90"
          >
            ×
          </button>
        </div>

        {view === "cart" ? (
          <>
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
                  onClick={() => {
                    setError(null);
                    setStep("shipping");
                  }}
                  className="hard-shadow inline-flex items-center justify-center bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-accent-ink transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
                >
                  Finalizează comanda
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={pay} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <p className="mb-5 text-sm text-ink/60">
                Adresa de livrare ajunge la atelier odată cu comanda. Nu o mai cerem încă o dată la
                plată.
              </p>
              <div className="flex flex-col gap-3">
                <Field
                  id="fullName"
                  label="Nume și prenume"
                  value={shipping.fullName}
                  onChange={(v) => setField("fullName", v)}
                  autoComplete="name"
                />
                <Field
                  id="phone"
                  label="Telefon"
                  value={shipping.phone}
                  onChange={(v) => setField("phone", v)}
                  autoComplete="tel"
                  inputMode="tel"
                />
                <Field
                  id="line1"
                  label="Stradă și număr"
                  value={shipping.line1}
                  onChange={(v) => setField("line1", v)}
                  autoComplete="address-line1"
                />
                <Field
                  id="line2"
                  label="Bloc, scara, apartament"
                  value={shipping.line2}
                  onChange={(v) => setField("line2", v)}
                  autoComplete="address-line2"
                  required={false}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="city"
                    label="Oraș"
                    value={shipping.city}
                    onChange={(v) => setField("city", v)}
                    autoComplete="address-level2"
                  />
                  <Field
                    id="postalCode"
                    label="Cod poștal"
                    value={shipping.postalCode}
                    onChange={(v) => setField("postalCode", v)}
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                </div>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
                    Județ
                  </span>
                  <select
                    id="county"
                    name="county"
                    required
                    value={shipping.county}
                    autoComplete="address-level1"
                    onChange={(e) => setField("county", e.target.value)}
                    className="h-10 border border-ink/25 bg-paper px-3 font-mono text-sm outline-none transition-colors hover:border-ink focus:border-ink"
                  >
                    <option value="" disabled>
                      Alege județul
                    </option>
                    {ROMANIAN_COUNTIES.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-ink/20 p-6">
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
                type="submit"
                disabled={isSubmitting}
                className={`hard-shadow inline-flex items-center justify-center bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-accent-ink transition-all duration-150 ${
                  isSubmitting
                    ? "cursor-wait opacity-60"
                    : "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
                }`}
              >
                {isSubmitting ? "Se deschide plata…" : "Plătește"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("cart");
                }}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/45 underline underline-offset-2 hover:text-ink"
              >
                Înapoi la coș
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
