import type { Release } from "@/app/types";
import ReleaseCard from "./ReleaseCard";

const yearOf = (date: string) => date.slice(0, 4);

export default function Timeline({ releases }: { releases: Release[] }) {
  let lastYear = "";

  return (
    <ol className="relative border-l border-line pl-8">
      {releases.map((release) => {
        const year = yearOf(release.releaseDate);
        const showYear = year !== lastYear;
        lastYear = year;

        return (
          <li key={release.id} className="relative mb-12 last:mb-0">
            <span
              aria-hidden
              className="absolute -left-[37px] top-2 h-3 w-3 rounded-full border-2 border-accent bg-paper"
            />
            {showYear && (
              <p className="mb-3 text-2xl font-bold tracking-tight text-ink">
                {year}
              </p>
            )}
            <ReleaseCard release={release} />
          </li>
        );
      })}
    </ol>
  );
}
