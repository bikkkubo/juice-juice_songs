import groupsData from "@/data/groups/index.json";
import juiceReleases from "@/data/groups/juice-juice/releases.json";
import juiceMembers from "@/data/groups/juice-juice/members.json";
import juiceAliases from "@/data/groups/juice-juice/aliases.json";
import juiceCredits from "@/data/groups/juice-juice/credits.json";
import angermeReleases from "@/data/groups/angerme/releases.json";
import angermeMembers from "@/data/groups/angerme/members.json";
import angermeAliases from "@/data/groups/angerme/aliases.json";
import angermeCredits from "@/data/groups/angerme/credits.json";
import morningReleases from "@/data/groups/morning-musume/releases.json";
import morningMembers from "@/data/groups/morning-musume/members.json";
import morningAliases from "@/data/groups/morning-musume/aliases.json";
import morningCredits from "@/data/groups/morning-musume/credits.json";
import ochaReleases from "@/data/groups/ocha-norma/releases.json";
import ochaMembers from "@/data/groups/ocha-norma/members.json";
import ochaAliases from "@/data/groups/ocha-norma/aliases.json";
import ochaCredits from "@/data/groups/ocha-norma/credits.json";
import tsubakiReleases from "@/data/groups/tsubaki-factory/releases.json";
import tsubakiMembers from "@/data/groups/tsubaki-factory/members.json";
import tsubakiAliases from "@/data/groups/tsubaki-factory/aliases.json";
import tsubakiCredits from "@/data/groups/tsubaki-factory/credits.json";
import rosyReleases from "@/data/groups/rosy-chronicle/releases.json";
import rosyMembers from "@/data/groups/rosy-chronicle/members.json";
import rosyAliases from "@/data/groups/rosy-chronicle/aliases.json";
import rosyCredits from "@/data/groups/rosy-chronicle/credits.json";
import beyooooondsReleases from "@/data/groups/beyooooonds/releases.json";
import beyooooondsMembers from "@/data/groups/beyooooonds/members.json";
import beyooooondsAliases from "@/data/groups/beyooooonds/aliases.json";
import beyooooondsCredits from "@/data/groups/beyooooonds/credits.json";
import type { Group, Member, Release, SongCredits } from "./types";

export const DEFAULT_GROUP_SLUG = "juice-juice";

type GroupDataset = {
  releases: Release[];
  members: Member[];
  aliases: Record<string, string>;
  credits: Record<string, SongCredits>;
};

const datasets: Record<string, GroupDataset> = {
  "juice-juice": {
    releases: juiceReleases as Release[],
    members: juiceMembers as Member[],
    aliases: juiceAliases as Record<string, string>,
    credits: juiceCredits as Record<string, SongCredits>,
  },
  angerme: {
    releases: angermeReleases as Release[],
    members: angermeMembers as Member[],
    aliases: angermeAliases as Record<string, string>,
    credits: angermeCredits as Record<string, SongCredits>,
  },
  "morning-musume": {
    releases: morningReleases as Release[],
    members: morningMembers as Member[],
    aliases: morningAliases as Record<string, string>,
    credits: morningCredits as Record<string, SongCredits>,
  },
  "ocha-norma": {
    releases: ochaReleases as Release[],
    members: ochaMembers as Member[],
    aliases: ochaAliases as Record<string, string>,
    credits: ochaCredits as Record<string, SongCredits>,
  },
  "tsubaki-factory": {
    releases: tsubakiReleases as Release[],
    members: tsubakiMembers as Member[],
    aliases: tsubakiAliases as Record<string, string>,
    credits: tsubakiCredits as Record<string, SongCredits>,
  },
  "rosy-chronicle": {
    releases: rosyReleases as Release[],
    members: rosyMembers as Member[],
    aliases: rosyAliases as Record<string, string>,
    credits: rosyCredits as Record<string, SongCredits>,
  },
  beyooooonds: {
    releases: beyooooondsReleases as Release[],
    members: beyooooondsMembers as Member[],
    aliases: beyooooondsAliases as Record<string, string>,
    credits: beyooooondsCredits as Record<string, SongCredits>,
  },
};

const groups = groupsData as Group[];
const groupMap = new Map(groups.map((group) => [group.slug, group]));

export const getGroups = (): Group[] => groups;

export const getGroup = (slug: string): Group | null => groupMap.get(slug) ?? null;

export const getGroupDataset = (slug: string): GroupDataset | null =>
  getGroup(slug) ? datasets[slug] ?? null : null;

export const groupPath = (groupSlug: string): string => `/${groupSlug}`;

export const memberPath = (groupSlug: string, name: string): string =>
  `/${groupSlug}/members/${encodeURIComponent(name)}`;
