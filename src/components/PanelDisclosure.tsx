import type { Ref } from "react";
import type { Panel } from "@/lib/product";

/**
 * Un panou de detalii (Îngrijire / Detalii produs / Livrare / Ghid mărimi) ca `<details>`
 * nativ, nu ca modal declanșat din state React.
 *
 * Înainte, conținutul ăsta (material, întreținere, condiții de livrare/retur, tabelul de
 * mărimi) exista doar în `DetailsModal`, montat condiționat (`{openPanel && <DetailsModal/>}`)
 * — deci absent din HTML-ul randat pe server. Niciun crawler care nu execută JS (Googlebot,
 * GPTBot, PerplexityBot, ClaudeBot etc. — toate citesc HTML brut) nu ajungea vreodată la el,
 * și nici un cititor de ecran care nu declanșează click-ul exact potrivit.
 *
 * `<details>` rezolvă asta structural: conținutul e mereu în DOM (deci în sursa paginii),
 * doar vizual strâns până la interacțiune — exact modelul pe care Google spune explicit că
 * îl indexează la fel ca textul vizibil.
 */
export function PanelDisclosure({
  panel,
  detailsRef,
}: {
  panel: Panel;
  detailsRef?: Ref<HTMLDetailsElement>;
}) {
  const { content } = panel;

  return (
    <details ref={detailsRef} className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-ink/70 transition-all duration-150 hover:translate-x-1 hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">[+]</span>
        <span className="hidden group-open:inline">[−]</span>
        {panel.label}
      </summary>

      <div className="mt-2 max-w-[46ch] text-[clamp(0.68rem,1.15vw,0.8125rem)] font-normal normal-case tracking-normal text-ink/70">
        {content.kind === "list" ? (
          <ul className="space-y-1.5">
            {content.items.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left">
                <thead>
                  <tr>
                    {content.columns.map((col) => (
                      <th
                        key={col}
                        className="border-b border-ink/20 pb-1.5 pr-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ink/50"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td
                          key={i}
                          className={`border-b border-ink/10 py-1.5 pr-3 ${i === 0 ? "font-mono font-bold" : ""}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.note && <p className="mt-2 text-[11px] text-ink/50">{content.note}</p>}
          </div>
        )}
      </div>
    </details>
  );
}
