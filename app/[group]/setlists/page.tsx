import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGroup, getGroups } from "@/app/groups";
import { groupMetadata } from "@/app/metadata";
import SetlistsPageClient from "@/components/SetlistsPageClient";

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
    title: "ライブセトリ",
    description: `${group.name} のライブセトリからコール練習ページへ移動できます。`,
    path: `/${group.slug}/setlists`,
  });
}

export default async function SetlistsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { group: groupSlug } = await params;
  const group = getGroup(groupSlug);
  if (!group) notFound();

  return <SetlistsPageClient group={group} />;
}
