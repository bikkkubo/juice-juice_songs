import type { Release } from "@/app/types";

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

const typeStyles: Record<Release["type"], string> = {
  indie: "bg-zinc-100 text-zinc-700",
  single: "bg-accent/10 text-accent",
  album: "bg-amber-100 text-amber-800",
  digital: "bg-sky-100 text-sky-800",
};

export default function ReleaseCard({ release }: { release: Release }) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <time className="font-mono text-muted">
          {formatDate(release.releaseDate)}
        </time>
        <span
          className={`rounded-full px-2 py-0.5 font-semibold ${typeStyles[release.type]}`}
        >
          {release.typeLabel}
        </span>
      </div>

      <h3 className="text-lg font-bold leading-snug">{release.title}</h3>

      {release.note && (
        <p className="mt-2 text-xs text-muted">{release.note}</p>
      )}

      {release.tracks.length > 0 && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-ink">
            収録曲 ({release.tracks.length}曲)
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
            {release.tracks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </details>
      )}

      {release.lineup.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {release.lineup.map((m) => (
            <span
              key={m}
              className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-ink/70"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {release.links && Object.values(release.links).some(Boolean) && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {release.links.youtube && (
            <a
              className="text-accent underline hover:no-underline"
              href={release.links.youtube}
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
          )}
          {release.links.apple && (
            <a
              className="text-accent underline hover:no-underline"
              href={release.links.apple}
              target="_blank"
              rel="noreferrer"
            >
              Apple Music
            </a>
          )}
          {release.links.spotify && (
            <a
              className="text-accent underline hover:no-underline"
              href={release.links.spotify}
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
          )}
          {release.links.official && (
            <a
              className="text-accent underline hover:no-underline"
              href={release.links.official}
              target="_blank"
              rel="noreferrer"
            >
              公式
            </a>
          )}
        </div>
      )}
    </article>
  );
}
