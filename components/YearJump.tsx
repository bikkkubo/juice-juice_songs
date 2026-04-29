"use client";

type Props = {
  years: string[];
};

export default function YearJump({ years }: Props) {
  const handleJump = (year: string) => {
    if (year === "ALL") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(`[data-year-anchor="${year}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const items = ["ALL", ...years];

  return (
    <nav
      aria-label="年で絞り込み"
      className="sticky top-[49px] z-30 -mx-5 border-b border-border bg-bg/85 px-5 py-2 backdrop-blur"
    >
      <ul className="no-scrollbar flex gap-2 overflow-x-auto">
        {items.map((y) => (
          <li key={y}>
            <button
              type="button"
              onClick={() => handleJump(y)}
              className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-ink-weak transition hover:border-accent hover:text-accent active:bg-accent/10"
            >
              {y}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
