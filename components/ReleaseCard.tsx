import type { Release } from "@/app/types";

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

const typeBg: Record<Release["type"], string> = {
  indie: "bg-type-indie/15 text-type-indie",
  single: "bg-type-single/15 text-type-single",
  album: "bg-type-album/15 text-type-album",
  digital: "bg-type-digital/15 text-type-digital",
};

export default function ReleaseCard({ release }: { release: Release }) {
  return (
    <article className="rounded-2xl border border-border bg-white/80 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition hover:border-accent-soft hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <time className="font-mono text-xs font-semibold text-ink-weak">
          {formatDate(release.releaseDate)}
        </time>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBg[release.type]}`}
        >
          {release.typeLabel}
        </span>
      </div>

      <h3 className="mt-2 text-base font-bold leading-snug text-ink">
        {release.title}
      </h3>

      {release.note && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-weak">
          {release.note}
        </p>
      )}

      {release.lineup.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {release.lineup.map((m) => (
            <span
              key={m}
              className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {release.tracks.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-xs font-mono text-ink-weak transition hover:text-accent">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>♪</span>
              <span>{release.tracks.length}曲</span>
              <span className="text-[10px] transition group-open:rotate-90">▸</span>
            </span>
          </summary>
          <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-ink/85">
            {release.tracks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </details>
      )}

      {release.links && Object.values(release.links).some(Boolean) && (
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-mono">
          {release.links.youtube && (
            <ExtLink href={release.links.youtube} label="YouTube" />
          )}
          {release.links.apple && (
            <ExtLink href={release.links.apple} label="Apple Music" />
          )}
          {release.links.spotify && (
            <ExtLink href={release.links.spotify} label="Spotify" />
          )}
          {release.links.official && (
            <ExtLink href={release.links.official} label="公式" />
          )}
        </div>
      )}
    </article>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-accent underline-offset-2 hover:underline"
    >
      ↗ {label}
    </a>
  );
}
