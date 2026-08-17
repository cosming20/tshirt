"use client";

import { useState } from "react";
import { DETAIL_PANELS, type DetailPanel } from "@/lib/product";

export function DetailsModal({
  initialPanel,
  onClose,
}: {
  initialPanel: DetailPanel;
  onClose: () => void;
}) {
  const [active, setActive] = useState<DetailPanel>(initialPanel);
  const activePanel = DETAIL_PANELS.find((p) => p.id === active)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="hard-shadow grid w-full max-w-2xl grid-cols-[minmax(140px,180px)_1fr] border border-ink bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="col-span-2 flex items-start justify-between border-b border-ink/20 p-6 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            {activePanel.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-2xl leading-none text-ink/70 transition hover:text-ink"
          >
            ×
          </button>
        </div>

        <nav className="border-r border-ink/20 p-6 text-xs font-semibold uppercase tracking-wide">
          <ul className="space-y-3">
            {DETAIL_PANELS.map((panel) => (
              <li key={panel.id}>
                <button
                  type="button"
                  onClick={() => setActive(panel.id)}
                  className={`text-left transition ${
                    panel.id === active ? "text-ink" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  [{panel.id === active ? "−" : "+"}] {panel.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 text-sm leading-relaxed">
          <ul className="space-y-3">
            {activePanel.content.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
