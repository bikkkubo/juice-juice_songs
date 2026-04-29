import Link from "next/link";
import type { Release } from "@/app/types";
import { lyricsSearchUrl } from "@/app/lyrics";
import { appleMusicUrl, spotifyUrl, youtubeUrl } from "@/app/streaming";
import { canonicalizeTitle } from "@/app/songs";
import Cover from "./Cover";

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

type Props = {
  release: Release;
  activeMember?: string | null;
};

export default function ReleaseCard({ release, activeMember = null }: Props) {
  const matches = !activeMember || release.lineup.includes(activeMember);
  const dim = activeMember && !matches;

  const links = release.links ?? {};
  const youtube = links.youtube ?? youtubeUrl(release.title);
  const apple = links.apple ?? appleMusicUrl(release.title);
  const spotify = links.spotify ?? spotifyUrl(release.title);

  return (
    <article
      id={release.id}
      className={`scroll-mt-28 rounded-2xl border bg-white/80 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition ${
        dim
          ? "border-border opacity-40 grayscale"
          : matches && activeMember
            ? "border-accent shadow-md"
            : "border-border hover:border-accent-soft hover:shadow-md"
      }`}
    >
      <div className="flex gap-3">
        <Cover release={release} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <time className="font-mono text-xs font-semibold text-ink-weak">
              {formatDate(release.releaseDate)}
            </time>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBg[release.type]}`}
            >
              {release.typeLabel}
            </span>
          </div>
          <h3 className="mt-1.5 break-words text-base font-bold leading-snug text-ink">
            {release.title}
          </h3>
        </div>
      </div>

      {release.note && (
        <p className="mt-3 text-xs leading-relaxed text-ink-weak">
          {release.note}
        </p>
      )}

      {release.lineup.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {release.lineup.map((m) => {
            const isActive = activeMember === m;
            return (
              <span
                key={m}
                className={
                  isActive
                    ? "rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white"
                    : "rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                }
              >
                {m}
              </span>
            );
          })}
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
          <ol className="mt-2 space-y-1.5 text-sm text-ink/85">
            {release.tracks.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 border-b border-border/60 pb-1 last:border-b-0 last:pb-0"
              >
                <Link
                  href={`/songs/${encodeURIComponent(canonicalizeTitle(t))}`}
                  className="flex flex-1 items-baseline gap-1.5 break-all transition hover:text-accent"
                >
                  <span className="font-mono text-[10px] text-ink-weak">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="underline-offset-2 hover:underline">{t}</span>
                </Link>
                <a
                  href={lyricsSearchUrl(t)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-mono text-[10px] text-ink-weak underline-offset-2 hover:text-accent hover:underline"
                  title={`${t} の歌詞を歌ネットで検索`}
                >
                  歌詞 ↗
                </a>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <ServiceLink href={youtube} label="YouTube" tone="youtube" />
        <ServiceLink href={apple} label="Apple Music" tone="apple" />
        <ServiceLink href={spotify} label="Spotify" tone="spotify" />
        {links.official && (
          <ServiceLink href={links.official} label="公式" tone="official" />
        )}
      </div>
    </article>
  );
}

function ServiceLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "youtube" | "apple" | "spotify" | "official";
}) {
  const styles: Record<typeof tone, string> = {
    youtube: "bg-red-50 text-red-600 hover:bg-red-100",
    apple: "bg-zinc-900 text-white hover:bg-zinc-800",
    spotify: "bg-green-50 text-green-700 hover:bg-green-100",
    official: "bg-surface text-ink-weak hover:bg-border",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] font-medium transition ${styles[tone]}`}
    >
      {label} ↗
    </a>
  );
}
