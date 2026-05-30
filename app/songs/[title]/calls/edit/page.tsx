import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllSongs,
  getSongByParam,
  songPath,
  songSlug,
} from "@/app/songs";
import { hasLiveVideoSource } from "@/app/liveVideoTitles";
import membersData from "@/data/members.json";
import type { Member } from "@/app/types";
import Header from "@/components/Header";
import CallTimingEditor from "@/components/CallTimingEditor";

type Params = { title: string };

export function generateStaticParams(): Params[] {
  return getAllSongs()
    .filter((song) => hasLiveVideoSource(song.canonical))
    .map((song) => ({ title: songSlug(song.canonical) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { title } = await params;
  const song = getSongByParam(title);
  if (!song) return { title: "楽曲が見つかりません" };

  return {
    title: `${song.canonical} コール編集 - Juice=Juiceコール練習サイト`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CallEditPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { title } = await params;
  const song = getSongByParam(title);
  if (!song) notFound();

  const totalSongs = getAllSongs().length;
  const totalMembers = (membersData as Member[]).length;

  return (
    <>
      <Header songCount={totalSongs} memberCount={totalMembers} />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-6">
        <Link
          href={songPath(song.canonical)}
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← 楽曲ページに戻る
        </Link>

        <header className="mb-6">
          <p className="mb-2 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
            CALL EDIT
          </p>
          <h1 className="break-words text-2xl font-bold leading-tight text-ink">
            {song.canonical}
          </h1>
        </header>

        <CallTimingEditor songTitle={song.canonical} />
      </main>
    </>
  );
}
