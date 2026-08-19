import fs from "node:fs";
import path from "node:path";
import { ANPC_LINKS, MANUFACTURER, RETURNS, SELLER } from "@/lib/legal";
import { PRODUCT } from "@/lib/product";

/** Pictogramele oficiale ANPC sunt opționale pe disc — dacă lipsesc, afișăm un link text în loc de o imagine ruptă. */
function hasBadgeImage(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-wrap gap-x-2">
      <span className="text-ink/45">{label}</span>
      <span>{value}</span>
    </p>
  );
}

export function SiteFooter() {
  const anpcBadges = [ANPC_LINKS.sal, ANPC_LINKS.sol].filter((badge) => badge.enabled);

  return (
    <footer className="border-t border-ink/15 bg-paper px-[clamp(1rem,4vw,2.5rem)] py-10 text-[13px] leading-relaxed">
      <div className="mx-auto flex max-w-5xl flex-col gap-9">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <section className="flex flex-col gap-1.5">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
              Vânzător
            </h2>
            <p className="font-semibold">{SELLER.name}</p>
            <Field label="CUI" value={SELLER.cui} />
            <Field label="Reg. Com." value={SELLER.regCom} />
            <Field label="Sediu" value={SELLER.address} />
            <p className="mt-1 flex flex-wrap gap-x-3">
              <a className="underline underline-offset-2" href={`mailto:${SELLER.email}`}>
                {SELLER.email}
              </a>
              <a className="underline underline-offset-2" href={`tel:${SELLER.phone.replace(/\s/g, "")}`}>
                {SELLER.phone}
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
              Retur și reclamații
            </h2>
            <p>
              Ai {RETURNS.windowDays} zile de la primire să returnezi produsul, fără să
              justifici motivul.
            </p>
            <p className="text-ink/70">{RETURNS.note}</p>
            <p className="mt-1">
              Scrie-ne la{" "}
              <a className="underline underline-offset-2" href={`mailto:${SELLER.email}`}>
                {SELLER.email}
              </a>{" "}
              și îți răspundem cu pașii de retur.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
              Producător
            </h2>
            <p className="font-semibold">{MANUFACTURER.name}</p>
            <a
              className="underline underline-offset-2"
              href={`tel:${MANUFACTURER.phone.replace(/\s/g, "")}`}
            >
              {MANUFACTURER.phone}
            </a>
            <p className="mt-1 text-ink/70">
              Tricourile sunt confecționate și printate în România.
            </p>
          </section>
        </div>

        {anpcBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {anpcBadges.map((badge) => (
              <a
                key={badge.href}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border border-ink/20 transition-colors hover:border-ink"
              >
                {hasBadgeImage(badge.image) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={badge.image}
                    alt={badge.label}
                    width={250}
                    height={50}
                    className="h-[38px] w-auto"
                  />
                ) : (
                  <span className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                    {badge.label}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        <p className="border-t border-ink/10 pt-5 text-ink/50">
          © {new Date().getFullYear()} {SELLER.name} · {PRODUCT.nav.brand}
        </p>
      </div>
    </footer>
  );
}
