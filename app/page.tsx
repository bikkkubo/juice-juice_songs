"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Release, Member } from "./types";
import { canonicalizeTitle, songPath } from "./songs";
import { getLiveSetlistsByLatest, type LiveSetlist } from "./setlists";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

type AuthState = {
  canEdit: boolean;
};

type ApprovedSong = {
  title: string;
  callCount: number;
  videoId: string | null;
};

export default function HomePage() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [approvedSongs, setApprovedSongs] = useState<ApprovedSong[] | null>(null);

  const allReleases = useMemo(
    () =>
      (releasesData as Release[])
        .slice()
        .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
    []
  );

  const allSongs = useMemo(() => {
    const titles = new Set<string>();
    for (const release of allReleases) {
      for (const track of release.tracks) titles.add(canonicalizeTitle(track));
    }
    return Array.from(titles).filter(Boolean).sort((a, b) => a.localeCompare(b, "ja"));
  }, [allReleases]);

  const members = membersData as Member[];
  const canEdit = auth?.canEdit ?? false;
  const setlists = getLiveSetlistsByLatest();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response): Promise<AuthState | null> =>
        response.ok ? ((await response.json()) as AuthState) : null
      )
      .then((data) => {
        if (!cancelled) setAuth(data);
      })
      .catch(() => {
        if (!cancelled) setAuth({ canEdit: false });
      });

    fetch("/api/approved-call-songs")
      .then(async (response): Promise<{ songs?: ApprovedSong[] } | null> =>
        response.ok ? ((await response.json()) as { songs?: ApprovedSong[] }) : null
      )
      .then((data) => {
        if (!cancelled) setApprovedSongs(data?.songs ?? []);
      })
      .catch(() => {
        if (!cancelled) setApprovedSongs([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header songCount={allSongs.length} memberCount={members.length} />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <section id="practice-songs" className="mb-12 scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-accent">
                PRACTICE READY
              </p>
              <h1 className="text-2xl font-bold leading-tight text-ink">
                コールが登録されている曲
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-weak">
                コールのタイミングが登録済みの曲です。ライブ前の確認はここから始められます。
              </p>
            </div>
            <span className="font-mono text-[11px] text-ink-weak">
              {approvedSongs === null ? "loading" : `${approvedSongs.length} songs`}
            </span>
          </div>
          {approvedSongs === null ? (
            <p className="rounded-lg border border-border bg-white px-4 py-6 text-center text-sm text-ink-weak">
              承認済みの曲を読み込んでいます
            </p>
          ) : approvedSongs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-ink-weak">
              公開中の練習曲はまだありません
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {approvedSongs.map((song) => (
                <PracticeSongRow key={song.title} song={song} canEdit={canEdit} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-14 rounded-2xl border border-border bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-ink-weak">
                FIRST CALLS
              </p>
              <h2 className="text-xl font-bold leading-tight text-ink">
                基本のコールを学ぶ
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-weak">
                最近Juice=Juiceを知った人向けに、汎用コールとメンバー名コールをまとめています。
              </p>
            </div>
            <Link
              href="/learn/"
              className="inline-flex min-h-10 shrink-0 items-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              はじめてのコールを見る
            </Link>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-ink-weak">
                SETLIST
              </p>
              <h2 className="text-xl font-bold leading-tight text-ink">
                ライブセトリ
              </h2>
              <p className="mt-1 text-xs text-ink-weak">
                ライブごとの曲順で、練習したい曲に移動できます。
              </p>
            </div>
            <Link
              href="/setlists/"
              className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              すべて見る
            </Link>
          </div>

          <div className="grid gap-3">
            {setlists.map((setlist) => (
              <SetlistSummary key={setlist.id} setlist={setlist} />
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

function PracticeSongRow({
  song,
  canEdit,
}: {
  song: ApprovedSong;
  canEdit: boolean;
}) {
  const href = songPath(song.title);
  const thumbnailUrl = song.videoId
    ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-accent/30 bg-white shadow-sm">
      <Link href={href} className="block bg-ink">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="aspect-video w-full object-cover transition duration-200 hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-accent/35 to-ink/80 px-4 text-center text-lg font-bold text-white">
            {song.title}
          </div>
        )}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <Link
            href={href}
            className="break-words text-base font-bold leading-snug text-ink underline-offset-2 hover:text-accent hover:underline"
          >
            {song.title}
          </Link>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              {song.callCount}件のコール
            </span>
            {song.videoId && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-weak">
                映像あり
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Link
            href={href}
            className="inline-flex min-h-9 items-center rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent/90"
          >
            練習
          </Link>
          {canEdit && (
            <Link
              href={`${href}/calls/edit`}
              className="inline-flex min-h-9 items-center rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              編集
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SetlistSummary({ setlist }: { setlist: LiveSetlist }) {
  const previewTracks = setlist.tracks.filter((track) => track.kind !== "note").slice(0, 5);

  return (
    <Link
      href={`/setlists/#${setlist.id}`}
      className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent hover:bg-accent/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold leading-snug text-ink">{setlist.title}</h3>
          {(setlist.date || setlist.venue) && (
            <p className="mt-1 font-mono text-[11px] text-ink-weak">
              {[setlist.date, setlist.venue].filter(Boolean).join(" / ")}
            </p>
          )}
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-weak">
          {setlist.tracks.length} songs
        </span>
      </div>
      <p className="mt-3 line-clamp-1 text-xs text-ink-weak">
        {previewTracks.map((track) => track.title).join(" / ")}
      </p>
    </Link>
  );
}
