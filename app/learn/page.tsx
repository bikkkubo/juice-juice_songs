import Link from "next/link";
import membersData from "@/data/members.json";
import { GENERAL_TEMPLATES, MEMBER_TEMPLATES } from "@/app/callTemplates";
import { getAllSongs, songPath } from "@/app/songs";
import type { Member } from "@/app/types";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

const firstSongs = [
  "盛れ!ミ・アモーレ",
  "プライド・ブライト",
  "CHOICE & CHANCE",
];

export default function LearnPage() {
  const members = membersData as Member[];

  return (
    <>
      <Header songCount={getAllSongs().length} memberCount={members.length} />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← トップに戻る
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-accent">
            FIRST CALLS
          </p>
          <h1 className="text-2xl font-bold leading-tight text-ink">
            基本のコールを学ぶ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-weak">
            最近Juice=Juiceを知った人向けの入口です。完璧に覚えるより、まずは表示されたコールを見ながらライブ映像に合わせるところから始めます。
          </p>
        </header>

        <section className="mb-10 rounded-2xl border border-border bg-white p-5">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-ink-weak">
            COMMON CALLS
          </p>
          <h2 className="text-xl font-bold leading-tight text-ink">
            よくあるコール集
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-weak">
            編集画面でも同じリストを使えます。まずは汎用コールとメンバー名コールを覚えると、曲ごとの練習に入りやすくなります。
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <CallGroup
              title="汎用"
              description="曲をまたいで使いやすい短いコールです。"
              phrases={GENERAL_TEMPLATES.map((template) => template.phrase)}
            />
            <CallGroup
              title="メンバー名"
              description="歌割りや見せ場に合わせて呼ぶメンバー名コールです。"
              phrases={MEMBER_TEMPLATES.map((template) => template.phrase)}
            />
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-accent/30 bg-white p-5">
          <h2 className="text-lg font-bold text-ink">練習の流れ</h2>
          <ol className="mt-4 grid gap-3 text-sm text-ink-weak">
            <li className="rounded-lg bg-surface px-3 py-3">
              <span className="font-semibold text-ink">1. 練習曲を開く</span>
              <br />
              トップの「コールが登録されている曲」から曲を選びます。
            </li>
            <li className="rounded-lg bg-surface px-3 py-3">
              <span className="font-semibold text-ink">2. 映像を再生する</span>
              <br />
              YouTubeの再生位置に合わせて、そのタイミングのコールが表示されます。
            </li>
            <li className="rounded-lg bg-surface px-3 py-3">
              <span className="font-semibold text-ink">3. 画面を見ながら声に出す</span>
              <br />
              慣れてきたら、表示を見なくても合わせられるように練習します。
            </li>
          </ol>
        </section>

        <section>
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-ink-weak">
              START HERE
            </p>
            <h2 className="text-xl font-bold text-ink">まず試す曲</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {firstSongs.map((song) => (
              <Link
                key={song}
                href={songPath(song)}
                className="rounded-xl border border-border bg-white p-4 transition hover:border-accent hover:bg-accent/5"
              >
                <p className="break-words text-sm font-bold text-ink">{song}</p>
                <p className="mt-2 text-xs text-accent">練習ページへ</p>
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

function CallGroup({
  title,
  description,
  phrases,
}: {
  title: string;
  description: string;
  phrases: string[];
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-weak">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {phrases.map((phrase) => (
          <span
            key={phrase}
            className="rounded-full border border-border bg-white px-2.5 py-1 text-sm font-semibold text-ink"
          >
            {phrase}
          </span>
        ))}
      </div>
    </article>
  );
}
