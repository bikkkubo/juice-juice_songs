import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GroupHome from "@/components/GroupHome";
import { getGroup, getGroups } from "@/app/groups";
import { groupMetadata } from "@/app/metadata";
import { getAllSongs } from "@/app/songs";

type Params = { group: string };

export function generateStaticParams(): Params[] {
  return getGroups().map((group) => ({ group: group.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { group: groupSlug } = await params;
  const group = getGroup(groupSlug);
  if (!group) return { title: "グループが見つかりません" };

  return groupMetadata({
    group,
    description: `${group.name} のライブ前にコールのタイミングを確認・練習できる非公式ファンサイト`,
    path: `/${group.slug}`,
  });
}

export default async function GroupPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { group: groupSlug } = await params;
  if (!getGroup(groupSlug)) notFound();

  // Touch the index during build so empty group data still gets validated.
  getAllSongs(groupSlug);

  return <GroupHome groupSlug={groupSlug} />;
}
