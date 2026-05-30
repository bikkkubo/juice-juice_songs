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
import type { Member } from "@/app/types";
import { getGroup, getGroupDataset, getGroups, groupPath } from "@/app/groups";
import { groupMetadata } from "@/app/metadata";
import Header from "@/components/Header";
import CallTimingEditor from "@/components/CallTimingEditor";

type Params = { group: string; title: string };

export function generateStaticParams(): Params[] {
  return getGroups().flatMap((group) =>
    getAllSongs(group.slug)
      .filter((song) => hasLiveVideoSource(song.canonical))
      .map((song) => ({
        group: group.slug,
        title: songSlug(song.canonical),
      }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { group: groupSlug, title } = await params;
  const group = getGroup(groupSlug);
  const song = getSongByParam(title, groupSlug);
  if (!group || !song) return { title: "楽曲が見つかりません" };

  return groupMetadata({
    group,
    title: `${song.canonical} コール編集`,
    description: `${song.canonical} (${group.name}) のコールタイミング編集ページ`,
    path: `${songPath(song.canonical, groupSlug)}/calls/edit`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function CallEditPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { group: groupSlug, title } = await params;
  const group = getGroup(groupSlug);
  const dataset = getGroupDataset(groupSlug);
  const song = getSongByParam(title, groupSlug);
  if (!group || !dataset || !song) notFound();

  const totalSongs = getAllSongs(groupSlug).length;
  const totalMembers = (dataset.members as Member[]).length;

  return (
    <>
      <Header
        songCount={totalSongs}
        memberCount={totalMembers}
        groupName={group.name}
        groupHref={groupPath(groupSlug)}
        groupSlug={groupSlug}
      />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-6">
        <Link
          href={songPath(song.canonical, groupSlug)}
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

        <CallTimingEditor songTitle={song.canonical} groupSlug={groupSlug} />
      </main>
    </>
  );
}
