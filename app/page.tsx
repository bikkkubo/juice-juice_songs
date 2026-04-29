import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Release, Member } from "./types";
import Header from "@/components/Header";
import YearJump from "@/components/YearJump";
import Timeline from "@/components/Timeline";
import MemberStrip from "@/components/MemberStrip";

export default function HomePage() {
  const releases = (releasesData as Release[])
    .slice()
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  const members = membersData as Member[];

  const years = Array.from(
    new Set(releases.map((r) => r.releaseDate.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <Header releaseCount={releases.length} memberCount={members.length} />
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
          <h2 className="mb-4 text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            DISCOGRAPHY
          </h2>
          <Timeline releases={[...releases].reverse()} />
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
