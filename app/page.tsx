"use client";

import { useMemo, useState } from "react";
import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Release, Member, ReleaseType } from "./types";
import Header from "@/components/Header";
import YearJump from "@/components/YearJump";
import Timeline from "@/components/Timeline";
import MemberStrip from "@/components/MemberStrip";
import TypeFilter from "@/components/TypeFilter";

const TYPE_KEYS: ReleaseType[] = ["indie", "single", "album", "digital"];

export default function HomePage() {
  const [activeTypes, setActiveTypes] = useState<ReleaseType[]>([]);

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
            年表でまとめました。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            MEMBERS
          </h2>
          <MemberStrip members={members} />
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

          <div className="mb-6">
            <TypeFilter
              active={activeTypes}
              counts={counts}
              onToggle={toggleType}
              onClear={() => setActiveTypes([])}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-ink-weak">
              該当するリリースはありません
            </p>
          ) : (
            <Timeline releases={[...filtered].reverse()} />
          )}
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-center text-[11px] text-ink-weak">
          <p>
            非公式ファンサイト。楽曲・画像の権利は
            アップフロントワークス／ハロー！プロジェクトに帰属します。
          </p>
          <p className="mt-1">
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
