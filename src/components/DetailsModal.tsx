"use client";

import { useEffect, useState } from "react";
import { ALL_PANELS, type DetailPanel } from "@/lib/product";

const CLOSE_ANIMATION_MS = 180;

export function DetailsModal({
  initialPanel,
  onClose,
}: {
  initialPanel: DetailPanel;
  onClose: () => void;
}) {
  const [active, setActive] = useState<DetailPanel>(initialPanel);
  const [closing, setClosing] = useState(false);
  const activePanel = ALL_PANELS.find((p) => p.id === active)!;
  const content = activePanel.content;

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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
        closing ? "opacity-0" : "animate-[fade-in_0.2s_ease-out]"
      }`}
      onClick={requestClose}
    >
      <div
        className={`hard-shadow grid h-[440px] max-h-[85vh] w-full max-w-2xl grid-cols-[minmax(140px,180px)_1fr] grid-rows-[auto_1fr] border border-ink bg-paper transition-all duration-200 ease-out ${
          closing
            ? "translate-y-1 scale-[0.97] opacity-0"
            : "animate-[modal-in_0.28s_cubic-bezier(0.16,1,0.3,1)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="col-span-2 flex items-start justify-between border-b border-ink/20 p-6 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {activePanel.label}
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

        <nav className="flex flex-col justify-center overflow-y-auto border-r border-ink/20 p-6 font-mono text-[11px] uppercase tracking-[0.08em]">
          <ul className="space-y-3">
            {ALL_PANELS.map((panel) => (
              <li key={panel.id}>
                <button
                  type="button"
                  onClick={() => setActive(panel.id)}
                  className={`text-left transition-all duration-150 hover:translate-x-0.5 ${
                    panel.id === active ? "text-accent" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  [{panel.id === active ? "−" : "+"}] {panel.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div
          key={active}
          className="flex h-full flex-col justify-center overflow-y-auto p-6 text-sm leading-relaxed animate-[fade-in_0.18s_ease-out]"
        >
          {content.kind === "list" ? (
            <ul className="space-y-3">
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
                          className="border-b border-ink/20 pb-2 pr-4 font-mono text-[10px] uppercase tracking-[0.08em] text-ink/50"
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
                            className={`border-b border-ink/10 py-2 pr-4 ${i === 0 ? "font-mono font-bold" : ""}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {content.note && (
                <p className="mt-3 text-xs text-ink/50">{content.note}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
