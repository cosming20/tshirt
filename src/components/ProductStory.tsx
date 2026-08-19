import { STORY } from "@/lib/product";

export function ProductStory() {
  return (
    <section
      id="poveste"
      className="border-t border-ink/15 bg-paper px-[clamp(1rem,4vw,2.5rem)] py-[clamp(3.5rem,9vh,6rem)]"
    >
      {/* Aceeași lățime de container ca footerul, ca marginea din stânga să fie continuă pe toată pagina. */}
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          {STORY.eyebrow}
        </p>

        {/* Cârligul, la dimensiune de titlu — el poartă tonul, restul îl explică. */}
        <p className="font-display max-w-[22ch] text-[clamp(1.5rem,4.2vw,2.5rem)] uppercase leading-[1.06] tracking-tight text-balance">
          {STORY.lead}
        </p>

        <div className="flex max-w-[62ch] flex-col gap-5 text-[clamp(0.95rem,1.5vw,1.0625rem)] leading-[1.7] text-ink/80">
          {STORY.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <p className="mt-2 border-t border-ink/15 pt-6 font-mono text-[clamp(0.7rem,1.2vw,0.8125rem)] uppercase tracking-[0.14em]">
          {STORY.closer}
        </p>
      </div>
    </section>
  );
}
