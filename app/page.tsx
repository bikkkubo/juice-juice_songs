import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";
import type { Release, Member } from "./types";
import Timeline from "@/components/Timeline";
import MemberStrip from "@/components/MemberStrip";

export default function HomePage() {
  const releases = (releasesData as Release[])
    .slice()
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  const members = membersData as Member[];

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <header className="mb-16 border-b border-line pb-10">
        <p className="mb-3 text-xs tracking-[0.4em] text-muted">
          JUICE=JUICE DISCOGRAPHY TIMELINE
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          Juice=Juice 楽曲年表
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          2013年のインディーズデビューから現在までの、シングル・アルバム・主要収録曲を
          発売日順にまとめた非公式ファンサイトです。
          <br />
          全{releases.length}リリース・{members.length}名の歴代メンバーを掲載。
        </p>
      </header>

      <section className="mb-16">
        <h2 className="mb-4 text-xs font-semibold tracking-[0.3em] text-muted">
          MEMBERS
        </h2>
        <MemberStrip members={members} />
      </section>

      <section>
        <h2 className="mb-8 text-xs font-semibold tracking-[0.3em] text-muted">
          DISCOGRAPHY
        </h2>
        <Timeline releases={releases} />
      </section>

      <footer className="mt-24 border-t border-line pt-8 text-center text-xs text-muted">
        <p>
          このサイトは非公式のファンによるアーカイブです。楽曲・画像の権利は
          アップフロントワークス／ハロー！プロジェクトに帰属します。
        </p>
        <p className="mt-2">
          公式サイト:{" "}
          <a
            className="underline hover:text-accent"
            href="https://helloproject.com/juicejuice/"
            target="_blank"
            rel="noreferrer"
          >
            helloproject.com/juicejuice
          </a>
        </p>
      </footer>
    </main>
  );
}
