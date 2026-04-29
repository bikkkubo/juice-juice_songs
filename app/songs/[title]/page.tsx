import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllSongs, getSong } from "@/app/songs";
import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Member, Release } from "@/app/types";
import { memberColor } from "@/app/colors";
import { lyricsSearchUrl } from "@/app/lyrics";
import { appleMusicUrl, spotifyUrl, youtubeUrl } from "@/app/streaming";
import Header from "@/components/Header";
import Cover from "@/components/Cover";

type Params = { title: string };

export function generateStaticParams(): Params[] {
  return getAllSongs().map((s) => ({ title: s.canonical }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const decoded = decodeURIComponent(params.title);
  const song = getSong(decoded);
  if (!song) return { title: "楽曲が見つかりません" };
  return {
    title: `${song.canonical} - Juice=Juice 楽曲年表`,
    description: `${song.canonical} (Juice=Juice) の収録リリース・歌詞・ストリーミング情報`,
  };
}

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

export default async function SongPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { title } = await params;
  const decoded = decodeURIComponent(title);
  const song = getSong(decoded);
  if (!song) notFound();

  const appearances = song.appearances;
  const main = appearances[0];
  const others = appearances.slice(1);

  const allMembers = membersData as Member[];
  const lineup = main.release.lineup
    .map((n) => allMembers.find((m) => m.name === n))
    .filter((m): m is Member => !!m);

  const totalReleases = (releasesData as Release[]).length;
  const totalMembers = allMembers.length;

  const youtube = youtubeUrl(song.canonical);
  const apple = appleMusicUrl(song.canonical);
  const spotify = spotifyUrl(song.canonical);
  const lyrics = lyricsSearchUrl(song.canonical);

  return (
    <>
      <Header releaseCount={totalReleases} memberCount={totalMembers} />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← TIMELINE に戻る
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
            SONG
          </p>
          <h1 className="break-words text-2xl font-bold leading-tight text-ink">
            {song.canonical}
          </h1>
          <p className="mt-2 font-mono text-[11px] text-ink-weak">
            {appearances.length} 件のリリースに収録
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ MAIN RELEASE
          </h2>
          <ReleaseRow appearance={main} size={72} primary />
        </section>

        {others.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
              ♪ ALSO INCLUDED ON
            </h2>
            <ul className="space-y-3">
              {others.map((a) => (
                <li key={a.release.id}>
                  <ReleaseRow appearance={a} size={56} canonical={song.canonical} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ LISTEN
          </h2>
          <div className="flex flex-wrap gap-2">
            <ServiceLink href={youtube} label="YouTube" tone="youtube" />
            <ServiceLink href={apple} label="Apple Music" tone="apple" />
            <ServiceLink href={spotify} label="Spotify" tone="spotify" />
          </div>
          <p className="mt-3 text-xs">
            <a
              href={lyrics}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              歌詞: 歌ネットで検索 ↗
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ LINEUP AT MAIN RELEASE
          </h2>
          <p className="mb-3 text-[11px] text-ink-weak">
            {formatDate(main.release.releaseDate)} 時点の {lineup.length} 名
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lineup.map((m) => (
              <Link
                key={m.name}
                href={`/members/${encodeURIComponent(m.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-sm text-ink transition hover:border-accent hover:bg-accent/5"
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: memberColor(m.color) }}
                />
                <span>{m.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ReleaseRow({
  appearance,
  size,
  primary = false,
  canonical,
}: {
  appearance: { release: Release; trackName: string; isCanonicalForm: boolean };
  size: number;
  primary?: boolean;
  canonical?: string;
}) {
  const r = appearance.release;
  const showVariant =
    canonical && appearance.trackName !== canonical;

  return (
    <Link
      href={`/#${r.id}`}
      className={`flex gap-3 rounded-2xl border bg-white p-3 transition hover:border-accent-soft hover:shadow-md ${
        primary ? "border-accent/40 shadow-sm" : "border-border"
      }`}
    >
      <Cover release={r} size={size} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <time className="font-mono text-xs font-semibold text-ink-weak">
            {formatDate(r.releaseDate)}
          </time>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBg[r.type]}`}
          >
            {r.typeLabel}
          </span>
        </div>
        <p className="mt-1 break-words text-sm font-bold leading-snug text-ink">
          {r.title}
        </p>
        {showVariant && (
          <p className="mt-1 text-[11px] text-ink-weak">
            ※ 「{appearance.trackName}」として収録
          </p>
        )}
      </div>
    </Link>
  );
}

function ServiceLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "youtube" | "apple" | "spotify";
}) {
  const styles: Record<typeof tone, string> = {
    youtube: "bg-red-50 text-red-600 hover:bg-red-100",
    apple: "bg-zinc-900 text-white hover:bg-zinc-800",
    spotify: "bg-green-50 text-green-700 hover:bg-green-100",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-mono text-xs font-medium transition ${styles[tone]}`}
    >
      ▶ {label} ↗
    </a>
  );
}
