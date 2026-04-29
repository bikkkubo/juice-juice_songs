import type { Release } from "@/app/types";
import ReleaseCard from "./ReleaseCard";

const yearOf = (date: string) => date.slice(0, 4);

export default function Timeline({ releases }: { releases: Release[] }) {
  const grouped = new Map<string, Release[]>();
  releases.forEach((r) => {
    const y = yearOf(r.releaseDate);
    if (!grouped.has(y)) grouped.set(y, []);
    grouped.get(y)!.push(r);
  });

  return (
    <div className="space-y-12">
      {[...grouped.entries()].map(([year, items]) => (
        <section key={year} data-year-anchor={year}>
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="font-mono text-3xl font-bold tracking-tight text-ink">
              {year}
            </h2>
            <span className="text-[11px] font-mono text-ink-weak">
              {items.length} releases
            </span>
          </div>

          <ol className="relative space-y-5 border-l-2 border-accent-soft/60 pl-6">
            {items.map((r) => (
              <li key={r.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-accent bg-bg"
                />
                <ReleaseCard release={r} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
