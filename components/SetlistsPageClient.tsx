"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGroupDataset, groupPath } from "@/app/groups";
import { canonicalizeTitle, getAllSongs, getSong, songPath } from "@/app/songs";
import {
  getLiveSetlistsByLatest,
  type LiveSetlist,
  type SetlistTrack,
} from "@/app/setlists";
import type { Group, Member } from "@/app/types";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

type AuthState = {
  canEdit: boolean;
};

type Props = {
  group: Group;
};

export default function SetlistsPageClient({ group }: Props) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const dataset = getGroupDataset(group.slug);
  const members = (dataset?.members ?? []) as Member[];
  const canEdit = auth?.canEdit ?? false;
  const setlists = getLiveSetlistsByLatest(group.slug);

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

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header
        songCount={getAllSongs(group.slug).length}
        memberCount={members.length}
        groupName={group.name}
        groupHref={groupPath(group.slug)}
        groupSlug={group.slug}
      />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href={groupPath(group.slug)}
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← トップに戻る
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
            LIVE SETLIST
          </p>
          <h1 className="text-2xl font-bold leading-tight text-ink">
            ライブセトリ
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-weak">
            ライブごとに、演奏された楽曲のコール練習ページへ移動できます。
          </p>
        </header>

        {setlists.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white px-4 py-8 text-center text-sm text-ink-weak">
            セトリはまだ登録されていません
          </p>
        ) : (
          <div className="space-y-5">
            {setlists.map((setlist) => (
              <SetlistCard
                key={setlist.id}
                setlist={setlist}
                canEdit={canEdit}
                groupSlug={group.slug}
              />
            ))}
          </div>
        )}

        <SiteFooter
          groupName={group.name}
          groupHref={groupPath(group.slug)}
          officialUrl={group.officialUrl}
        />
      </main>
    </>
  );
}

function SetlistCard({
  setlist,
  canEdit,
  groupSlug,
}: {
  setlist: LiveSetlist;
  canEdit: boolean;
  groupSlug: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">{setlist.title}</h2>
          {(setlist.date || setlist.venue) && (
            <p className="mt-1 font-mono text-[11px] text-ink-weak">
              {[setlist.date, setlist.venue].filter(Boolean).join(" / ")}
            </p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-ink-weak">
            {setlist.note}
          </p>
          {setlist.sourceUrl && (
            <a
              href={setlist.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs text-accent underline-offset-2 hover:underline"
            >
              {setlist.sourceLabel ?? "出典を開く"} ↗
            </a>
          )}
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] text-accent">
          {setlist.tracks.length} songs
        </span>
      </div>

      <ol className="grid gap-2">
        {setlist.tracks.map((track, index) => (
          <SetlistTrackRow
            key={`${setlist.id}-${track.title}`}
            index={index}
            track={track}
            canEdit={canEdit}
            groupSlug={groupSlug}
          />
        ))}
      </ol>
    </section>
  );
}

function SetlistTrackRow({
  index,
  track,
  canEdit,
  groupSlug,
}: {
  index: number;
  track: SetlistTrack;
  canEdit: boolean;
  groupSlug: string;
}) {
  const href = songPath(track.title, groupSlug);
  const isNote = track.kind === "note";
  const canonical = canonicalizeTitle(track.title, groupSlug);
  const songExists = !!getSong(canonical, groupSlug);

  return (
    <li className="grid gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 sm:grid-cols-[44px_1fr_auto]">
      <span className="font-mono text-xs text-ink-weak">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        {isNote || !songExists ? (
          <p className="break-words text-sm font-bold text-ink">{track.title}</p>
        ) : (
          <Link
            href={songPath(canonical, groupSlug)}
            className="break-words text-sm font-bold text-ink underline-offset-2 hover:text-accent hover:underline"
          >
            {track.title}
          </Link>
        )}
        <p className="mt-0.5 text-[11px] text-ink-weak">{track.source}</p>
        {track.note && (
          <p className="mt-1 text-[11px] leading-relaxed text-ink-weak">
            {track.note}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        {!isNote && songExists && (
          <Link
            href={songPath(canonical, groupSlug)}
            className="inline-flex min-h-9 items-center justify-center rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent/90"
          >
            練習する
          </Link>
        )}
        {!isNote && songExists && canEdit && (
          <Link
            href={`${songPath(canonical, groupSlug)}/calls/edit`}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            編集する
          </Link>
        )}
      </div>
    </li>
  );
}
