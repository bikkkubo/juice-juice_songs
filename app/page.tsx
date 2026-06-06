import Link from "next/link";
import { getGroupDataset, getGroups, groupPath } from "@/app/groups";
import { hasLiveVideoSource } from "@/app/liveVideoTitles";
import { canonicalizeTitle, getAllSongs, songPath } from "@/app/songs";
import PracticeNotice from "@/components/PracticeNotice";

export default function HomePage() {
  const groups = getGroups();
  const groupsWithCallLinks = groups
    .map((group) => {
      const songs = getAllSongs(group.slug)
        .map((song) => canonicalizeTitle(song.canonical, group.slug))
        .filter((title) => hasLiveVideoSource(title))
        .filter((title, index, titles) => titles.indexOf(title) === index)
        .sort((a, b) => a.localeCompare(b, "ja"));

      return { group, songs };
    })
    .filter(({ songs }) => songs.length > 0);

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

        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-accent">
                CALL LINKS
              </p>
              <h2 className="text-2xl font-bold leading-tight text-ink">
                コール練習リンク一覧
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-weak">
                映像や音源に合わせて確認できる曲ページへのリンクです。
              </p>
            </div>
            <span className="font-mono text-[11px] text-ink-weak">
              {groupsWithCallLinks.reduce((sum, item) => sum + item.songs.length, 0)} songs
            </span>
          </div>

          <div className="grid gap-4">
            {groupsWithCallLinks.map(({ group, songs }) => (
              <section
                key={group.slug}
                className="rounded-2xl border border-border bg-white p-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold leading-tight text-ink">
                    {group.name}
                  </h3>
                  <Link
                    href={groupPath(group.slug)}
                    className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                  >
                    グループページへ
                  </Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {songs.map((title) => (
                    <Link
                      key={`${group.slug}-${title}`}
                      href={songPath(title, group.slug)}
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold leading-snug text-ink transition hover:border-accent hover:bg-accent/5 hover:text-accent"
                    >
                      {title}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
