"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Release, Member, ReleaseType } from "./types";
import { memberColor } from "./colors";
import Header from "@/components/Header";
import YearJump from "@/components/YearJump";
import Timeline from "@/components/Timeline";
import MemberStrip from "@/components/MemberStrip";
import TypeFilter from "@/components/TypeFilter";

export default function HomePage() {
  const [activeTypes, setActiveTypes] = useState<ReleaseType[]>([]);
  const [activeMember, setActiveMember] = useState<string | null>(null);

  const allReleases = useMemo(
    () =>
      (releasesData as Release[])
        .slice()
        .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
    []
  );

  const counts = useMemo(() => {
    const c = { indie: 0, single: 0, album: 0, digital: 0 } as Record<
      ReleaseType,
      number
    >;
    for (const r of allReleases) c[r.type]++;
    return c;
  }, [allReleases]);

  const filtered = useMemo(() => {
    if (activeTypes.length === 0) return allReleases;
    return allReleases.filter((r) => activeTypes.includes(r.type));
  }, [allReleases, activeTypes]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(filtered.map((r) => r.releaseDate.slice(0, 4)))
      ).sort((a, b) => b.localeCompare(a)),
    [filtered]
  );

  const members = membersData as Member[];

  const memberMatchCount = useMemo(() => {
    if (!activeMember) return 0;
    return filtered.filter((r) => r.lineup.includes(activeMember)).length;
  }, [filtered, activeMember]);

  const toggleType = (t: ReleaseType) =>
    setActiveTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  return (
    <>
      <Header releaseCount={allReleases.length} memberCount={members.length} />
      <YearJump years={years} />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <section className="mb-10">
          <p className="text-xs leading-relaxed text-ink-weak">
            2013 年のインディーズデビューから現在まで。Juice=Juice の発売楽曲を
            年表でまとめました。メンバー名をタップで在籍リリースをハイライトします。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            MEMBERS
          </h2>
          <MemberStrip
            members={members}
            activeMember={activeMember}
            onSelect={setActiveMember}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
              DISCOGRAPHY
            </h2>
            <span className="font-mono text-[11px] text-ink-weak">
              {filtered.length} / {allReleases.length}
            </span>
          </div>

          <div className="mb-4">
            <TypeFilter
              active={activeTypes}
              counts={counts}
              onToggle={toggleType}
              onClear={() => setActiveTypes([])}
            />
          </div>

          {activeMember && (
            <ActiveMemberBanner
              name={activeMember}
              colorName={
                members.find((m) => m.name === activeMember)?.color ?? ""
              }
              matchCount={memberMatchCount}
              total={filtered.length}
              onClear={() => setActiveMember(null)}
            />
          )}

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-ink-weak">
              該当するリリースはありません
            </p>
          ) : (
            <Timeline
              releases={[...filtered].reverse()}
              activeMember={activeMember}
            />
          )}
        </section>

        <footer className="mt-20 space-y-2 border-t border-border pt-6 text-center text-[11px] text-ink-weak">
          <p>
            非公式ファンサイト。楽曲・画像の権利は
            アップフロントワークス／ハロー！プロジェクトに帰属します。
          </p>
          <p>
            歌詞はJASRAC許諾済の{" "}
            <a
              className="text-accent underline-offset-2 hover:underline"
              href="https://www.uta-net.com/search/?Aselect=3&Keyword=Juice%3DJuice"
              target="_blank"
              rel="noreferrer"
            >
              歌ネット ↗
            </a>{" "}
            の検索結果へリンクしています。
          </p>
          <p>
            <a
              className="text-accent underline-offset-2 hover:underline"
              href="https://helloproject.com/juicejuice/"
              target="_blank"
              rel="noreferrer"
            >
              公式サイト ↗
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}

function ActiveMemberBanner({
  name,
  colorName,
  matchCount,
  total,
  onClear,
}: {
  name: string;
  colorName: string;
  matchCount: number;
  total: number;
  onClear: () => void;
}) {
  const color = memberColor(colorName);
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2">
      <div className="flex items-center gap-2 text-xs">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-ink">{name}</span>
        <span className="font-mono text-ink-weak">
          {matchCount} / {total} リリースに参加
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/members/${encodeURIComponent(name)}`}
          className="rounded-full border border-accent bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white transition hover:bg-accent/90"
        >
          詳細を見る →
        </Link>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] text-ink-weak transition hover:border-ink/30 hover:text-ink"
        >
          × 解除
        </button>
      </div>
    </div>
  );
}
