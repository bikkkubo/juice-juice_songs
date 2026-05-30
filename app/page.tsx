import Link from "next/link";
import { getGroupDataset, getGroups, groupPath } from "@/app/groups";
import { getAllSongs } from "@/app/songs";
import PracticeNotice from "@/components/PracticeNotice";

export default function HomePage() {
  const groups = getGroups();

  return (
    <>
      <PracticeNotice />
      <main className="mx-auto max-w-page px-5 py-10">
        <header className="mb-8">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-accent">
            HELLO! PROJECT CALLS
          </p>
          <h1 className="text-3xl font-bold leading-tight text-ink">
            グループを選ぶ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-weak">
            グループ別ページから、ライブ前に楽曲情報とコール練習を確認できます。
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => {
            const dataset = getGroupDataset(group.slug);
            const releaseCount = dataset?.releases.length ?? 0;
            const songCount = getAllSongs(group.slug).length;
            const memberCount = dataset?.members.length ?? 0;

            return (
              <Link
                key={group.slug}
                href={groupPath(group.slug)}
                className="rounded-2xl border border-border bg-white p-5 transition hover:border-accent hover:bg-accent/5"
              >
                <h2 className="text-xl font-bold leading-tight text-ink">
                  {group.name}
                </h2>
                <p className="mt-2 font-mono text-[11px] text-ink-weak">
                  {releaseCount} releases / {songCount} songs / {memberCount} members
                </p>
                <p className="mt-4 text-xs font-semibold text-accent">
                  ページを見る
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
