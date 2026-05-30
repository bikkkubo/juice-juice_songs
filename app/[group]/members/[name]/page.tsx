import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Member, Release } from "@/app/types";
import { memberColor } from "@/app/colors";
import { getAllSongs } from "@/app/songs";
import {
  getGroup,
  getGroupDataset,
  getGroups,
  groupPath,
} from "@/app/groups";
import { groupMetadata } from "@/app/metadata";
import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import SiteFooter from "@/components/SiteFooter";

type Params = { group: string; name: string };

export function generateStaticParams(): Params[] {
  return getGroups().flatMap((group) => {
    const dataset = getGroupDataset(group.slug);
    return ((dataset?.members ?? []) as Member[]).map((m) => ({
      group: group.slug,
      name: m.name,
    }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { group: groupSlug, name } = await params;
  const decoded = decodeURIComponent(name);
  const group = getGroup(groupSlug);
  const dataset = getGroupDataset(groupSlug);
  const m = ((dataset?.members ?? []) as Member[]).find((x) => x.name === decoded);
  if (!group || !m) return { title: "メンバーが見つかりません" };
  return groupMetadata({
    group,
    title: m.name,
    description: `${m.name} (${m.color}) が参加した ${group.name} のリリース一覧`,
    path: `/${group.slug}/members/${encodeURIComponent(m.name)}`,
  });
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
};

const calcAge = (birthday: string, ref?: string) => {
  const b = new Date(birthday);
  const r = ref ? new Date(ref) : new Date();
  let age = r.getFullYear() - b.getFullYear();
  const md = r.getMonth() - b.getMonth();
  if (md < 0 || (md === 0 && r.getDate() < b.getDate())) age--;
  return age;
};

export default async function MemberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { group: groupSlug, name } = await params;
  const decoded = decodeURIComponent(name);
  const group = getGroup(groupSlug);
  const dataset = getGroupDataset(groupSlug);
  if (!group || !dataset) notFound();

  const allMembers = dataset.members as Member[];
  const member = allMembers.find((m) => m.name === decoded);
  if (!member) notFound();

  const allReleases = (dataset.releases as Release[])
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

  const age = member.birthday
    ? calcAge(member.birthday, isCurrent ? undefined : member.left ?? undefined)
    : null;

  return (
    <>
      <Header
        songCount={getAllSongs(groupSlug).length}
        memberCount={allMembers.length}
        groupName={group.name}
        groupHref={groupPath(groupSlug)}
        groupSlug={groupSlug}
      />

      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href={groupPath(groupSlug)}
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← トップに戻る
        </Link>

        <header className="mb-10 rounded-2xl border border-border bg-white p-6">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="mt-1 inline-block h-12 w-12 shrink-0 rounded-full ring-2 ring-border"
              style={{ backgroundColor: dot }}
            />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
                {isCurrent ? "CURRENT MEMBER" : "FORMER MEMBER"}
              </p>
              <h1 className="text-2xl font-bold leading-tight text-ink">
                {member.name}
              </h1>
              {member.reading && (
                <p className="mt-0.5 font-mono text-[11px] text-ink-weak">
                  {member.reading}
                </p>
              )}
              {member.nickname && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  愛称: {member.nickname}
                </p>
              )}
              <p className="mt-2 text-xs text-ink-weak">
                メンバーカラー: <span className="text-ink">{member.color}</span>
              </p>
              {member.note && (
                <p className="mt-2 text-xs leading-relaxed text-ink-weak">
                  {member.note}
                </p>
              )}
            </div>
          </div>

          {(member.birthday ||
            member.birthplace ||
            member.height ||
            member.bloodType ||
            member.isTrainee ||
            member.graduationVenue) && (
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
              {member.birthday && (
                <Fact
                  label="誕生日"
                  value={
                    <>
                      <span className="font-mono">
                        {formatDate(member.birthday)}
                      </span>
                      {age !== null && (
                        <span className="ml-1 text-xs text-ink-weak">
                          ({age}歳{!isCurrent && "・卒業時"})
                        </span>
                      )}
                    </>
                  }
                />
              )}
              {member.birthplace && (
                <Fact label="出身地" value={member.birthplace} />
              )}
              {member.height && (
                <Fact label="身長" value={member.height} />
              )}
              {member.bloodType && (
                <Fact label="血液型" value={member.bloodType} />
              )}
              {member.isTrainee && (
                <Fact label="出身" value="ハロプロ研修生" />
              )}
              {member.graduationVenue && (
                <Fact label="卒業公演" value={member.graduationVenue} />
              )}
            </dl>
          )}

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
            <Timeline
              releases={memberReleases}
              activeMember={decoded}
              groupSlug={groupSlug}
              artistKeyword={group.artistKeyword}
            />
          )}
        </section>

        <SiteFooter
          groupName={group.name}
          groupHref={groupPath(groupSlug)}
          officialUrl={group.officialUrl}
        />
      </main>
    </>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 text-[10px] font-mono tracking-wider text-ink-weak">
        {label}
      </dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
