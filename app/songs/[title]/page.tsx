import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllSongs,
  getCredits,
  getSongByParam,
  songPath,
  songSlug,
} from "@/app/songs";
import membersData from "@/data/members.json";
import type { Member, Release } from "@/app/types";
import { memberColor } from "@/app/colors";
import { lyricsSearchUrl } from "@/app/lyrics";
import { appleMusicUrl, spotifyUrl, youtubeUrl } from "@/app/streaming";
import Header from "@/components/Header";
import Cover from "@/components/Cover";
import SongCallLab from "@/components/SongCallLab";
import SiteFooter from "@/components/SiteFooter";

type Params = { title: string };

export function generateStaticParams(): Params[] {
  return getAllSongs().map((s) => ({ title: songSlug(s.canonical) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { title } = await params;
  const song = getSongByParam(title);
  if (!song) return { title: "楽曲が見つかりません" };
  const path = songPath(song.canonical);
  const siteName = "Juice=Juiceコール練習サイト";
  const description = `${song.canonical} (Juice=Juice) の収録リリース・ライブ映像・コール練習情報`;
  return {
    title: `${song.canonical} - ${siteName}`,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${song.canonical} - ${siteName}`,
      description,
      url: path,
      siteName,
      locale: "ja_JP",
      type: "music.song",
      images: [
        {
          url: "/og/juice-juice.png",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${song.canonical} - ${siteName}`,
      description,
      images: ["/og/juice-juice.png"],
    },
  };
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

const dateLabel = (release: Release) =>
  release.type === "unreleased" ? "未音源化" : formatDate(release.releaseDate);

const typeBg: Record<Release["type"], string> = {
  indie: "bg-type-indie/15 text-type-indie",
  single: "bg-type-single/15 text-type-single",
  album: "bg-type-album/15 text-type-album",
  digital: "bg-type-digital/15 text-type-digital",
  unreleased: "bg-type-unreleased/15 text-type-unreleased",
};

export default async function SongPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { title } = await params;
  const song = getSongByParam(title);
  if (!song) notFound();

  const appearances = song.appearances;
  const main = appearances[0];
  const others = appearances.slice(1);

  const allMembers = membersData as Member[];
  const lineup = main.release.lineup
    .map((n) => allMembers.find((m) => m.name === n))
    .filter((m): m is Member => !!m);

  const totalSongs = getAllSongs().length;
  const totalMembers = allMembers.length;

  const youtube = youtubeUrl(song.canonical);
  const apple = appleMusicUrl(song.canonical);
  const spotify = spotifyUrl(song.canonical);
  const lyrics = lyricsSearchUrl(song.canonical);
  const credits = getCredits(song.canonical);

  return (
    <>
      <Header songCount={totalSongs} memberCount={totalMembers} />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← トップに戻る
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

        {credits && (
          <section className="mb-8">
            <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
              ♪ CREDITS
            </h2>
            <dl className="space-y-1.5 rounded-2xl border border-border bg-white p-4 text-sm">
              {credits.lyricist && (
                <div className="flex items-baseline gap-3">
                  <dt className="w-12 shrink-0 font-mono text-[10px] tracking-wider text-ink-weak">
                    作詞
                  </dt>
                  <dd className="text-ink">{credits.lyricist}</dd>
                </div>
              )}
              {credits.composer && (
                <div className="flex items-baseline gap-3">
                  <dt className="w-12 shrink-0 font-mono text-[10px] tracking-wider text-ink-weak">
                    作曲
                  </dt>
                  <dd className="text-ink">{credits.composer}</dd>
                </div>
              )}
              {credits.arranger && (
                <div className="flex items-baseline gap-3">
                  <dt className="w-12 shrink-0 font-mono text-[10px] tracking-wider text-ink-weak">
                    編曲
                  </dt>
                  <dd className="text-ink">{credits.arranger}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {main.release.type === "unreleased" ? (
          <section className="mb-8 rounded-2xl border border-border bg-white p-4">
            <h2 className="mb-2 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
              ♪ UNRELEASED
            </h2>
            <p className="text-sm leading-relaxed text-ink-weak">
              この曲は未音源化です。ライブ映像に合わせたコール表示・編集用ページとして登録しています。
            </p>
          </section>
        ) : (
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
        )}

        <SongCallLab
          songTitle={song.canonical}
          editHref={`${songPath(song.canonical)}/calls/edit`}
        />

        <section className="mb-10">
          <h2 className="mb-1 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ LINEUP AT MAIN RELEASE
          </h2>
          <p className="mb-3 text-[11px] text-ink-weak">
            {dateLabel(main.release)} 時点の {lineup.length} 名
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

        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ MAIN RELEASE
          </h2>
          <ReleaseRow appearance={main} size={72} primary />
        </section>

        {others.length > 0 && (
          <section>
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

        <SiteFooter />
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
            {dateLabel(r)}
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
