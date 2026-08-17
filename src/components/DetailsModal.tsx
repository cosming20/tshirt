"use client";

import { useEffect, useState } from "react";
import { DETAIL_PANELS, type DetailPanel } from "@/lib/product";

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
  const activePanel = DETAIL_PANELS.find((p) => p.id === active)!;

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
        className={`hard-shadow grid w-full max-w-2xl grid-cols-[minmax(140px,180px)_1fr] border border-ink bg-paper transition-all duration-200 ease-out ${
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

        <nav className="border-r border-ink/20 p-6 font-mono text-[11px] uppercase tracking-[0.08em]">
          <ul className="space-y-3">
            {DETAIL_PANELS.map((panel) => (
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

        <div key={active} className="animate-[fade-in_0.18s_ease-out] p-6 text-sm leading-relaxed">
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
