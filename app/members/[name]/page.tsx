import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import membersData from "@/data/members.json";
import releasesData from "@/data/releases.json";
import type { Member, Release } from "@/app/types";
import { memberColor } from "@/app/colors";
import Header from "@/components/Header";
import Timeline from "@/components/Timeline";

type Params = { name: string };

export function generateStaticParams(): Params[] {
  return (membersData as Member[]).map((m) => ({ name: m.name }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const decoded = decodeURIComponent(params.name);
  const m = (membersData as Member[]).find((x) => x.name === decoded);
  if (!m) return { title: "メンバーが見つかりません" };
  return {
    title: `${m.name} - Juice=Juice 楽曲年表`,
    description: `${m.name} (${m.color}) が参加した Juice=Juice のリリース一覧`,
  };
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

export default async function MemberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);

  const allMembers = membersData as Member[];
  const member = allMembers.find((m) => m.name === decoded);
  if (!member) notFound();

  const allReleases = (releasesData as Release[])
    .slice()
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

  const memberReleases = allReleases.filter((r) =>
    r.lineup.includes(decoded)
  );

  const dot = memberColor(member.color);
  const isCurrent = member.left === null;
  const tenureDays = Math.floor(
    ((member.left ? new Date(member.left).getTime() : Date.now()) -
      new Date(member.joined).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <Header
        releaseCount={allReleases.length}
        memberCount={allMembers.length}
      />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← TIMELINE に戻る
        </Link>

        <header className="mb-10 rounded-2xl border border-border bg-white p-6">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="mt-1 inline-block h-10 w-10 shrink-0 rounded-full ring-2 ring-border"
              style={{ backgroundColor: dot }}
            />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-mono tracking-[0.25em] text-ink-weak">
                {isCurrent ? "CURRENT MEMBER" : "FORMER MEMBER"}
              </p>
              <h1 className="text-2xl font-bold text-ink">{member.name}</h1>
              <p className="mt-1 text-sm text-ink-weak">
                メンバーカラー: {member.color}
              </p>
              {member.note && (
                <p className="mt-2 text-xs leading-relaxed text-ink-weak">
                  {member.note}
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4 text-center">
            <div>
              <dt className="text-[10px] font-mono tracking-wider text-ink-weak">
                JOINED
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">
                {formatDate(member.joined)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono tracking-wider text-ink-weak">
                {isCurrent ? "STATUS" : "LEFT"}
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">
                {isCurrent ? "現役" : formatDate(member.left!)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono tracking-wider text-ink-weak">
                TENURE
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-ink">
                {tenureDays.toLocaleString()}日
              </dd>
            </div>
          </dl>
        </header>

        <section>
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
              PARTICIPATED RELEASES
            </h2>
            <span className="font-mono text-[11px] text-ink-weak">
              {memberReleases.length} / {allReleases.length}
            </span>
          </div>

          {memberReleases.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-ink-weak">
              参加リリースが見つかりません
            </p>
          ) : (
            <Timeline releases={memberReleases} activeMember={decoded} />
          )}
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-center text-[11px] text-ink-weak">
          <Link
            href="/"
            className="text-accent underline-offset-2 hover:underline"
          >
            TIMELINE トップに戻る
          </Link>
        </footer>
      </main>
    </>
  );
}
