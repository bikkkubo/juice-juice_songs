import fs from "node:fs/promises";
import path from "node:path";

const VERSION_PAGE = "https://helloproject.com/angerme/release/?a=angerme";
const JSON_BASE = "https://helloproject.com/json";
const DETAIL_BASE = "https://helloproject.com";

const GROUPS = [
  { slug: "angerme", officialKey: "angerme", officialGroupId: 29, idPrefix: "ang" },
  {
    slug: "morning-musume",
    officialKey: "morningmusume",
    officialGroupId: 3,
    idPrefix: "mm",
  },
  {
    slug: "ocha-norma",
    officialKey: "ochanorma",
    officialGroupId: 634,
    idPrefix: "ocha",
  },
  {
    slug: "tsubaki-factory",
    officialKey: "tsubakifactory",
    officialGroupId: 477,
    idPrefix: "tsubaki",
  },
  {
    slug: "rosy-chronicle",
    officialKey: "rosychronicle",
    officialGroupId: 676,
    idPrefix: "rosy",
  },
  {
    slug: "beyooooonds",
    officialKey: "beyooooonds",
    officialGroupId: 585,
    idPrefix: "beyo",
  },
];

const TARGET_CATEGORIES = new Set(["single", "album", "distribution"]);

const htmlDecode = (value) =>
  value
    .replace(/<!-- -->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (value) => htmlDecode(value.replace(/<[^>]*>/g, ""));

const cleanTrackTitle = (title) =>
  title
    .replace(/【Additional Track】/g, "")
    .replace(/\s*\((?:Instrumental|オリジナル・カラオケ|カラオケ|[^)]*off vocal)\)\s*$/iu, "")
    .replace(/\s*（(?:Instrumental|オリジナル・カラオケ|カラオケ|[^）]*off vocal)）\s*$/iu, "")
    .trim();

const looksLikeSong = (title) => {
  if (!title) return false;
  return !/(?:Instrumental|オリジナル・カラオケ|カラオケ|off vocal|Music Video|Dance\s*Shot|Dance Performance|メイキング|Making|Close-up|Blu-ray|DVD|特典映像|ライブ映像|コメント|ジャケット撮影|インタビュー|OPENING|MC|SPOT|Trailer|Teaser)/i.test(
    title
  );
};

const splitTitleFallback = (title) =>
  title
    .replace(/\((?:曲順未定|Special Edition)\)/g, "")
    .replace(/（(?:曲順未定|Special Edition)）/g, "")
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(looksLikeSong);

const releaseType = (category) => {
  if (category.includes("album")) return "album";
  if (category.includes("distribution")) return "digital";
  return "single";
};

const absoluteImage = (imageUrl) => {
  if (!imageUrl) return undefined;
  if (imageUrl.includes("release-placeholder")) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${DETAIL_BASE}${imageUrl}`;
};

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const getVersionDir = async () => {
  const html = await fetchText(VERSION_PAGE);
  const match = html.match(/versionDir&quot;:\[0,&quot;([^&]+)&quot;/);
  if (!match) throw new Error("versionDir not found");
  return match[1];
};

const extractTrackItems = (html) => {
  const items = [];
  const trackListBlocks = html
    .split('<div class="TrackList">')
    .slice(1)
    .map((block) => `<div class="TrackList">${block}`);

  const cdBlocks = trackListBlocks.filter((block) => {
    const mediaType = block.match(/ReleaseEdition__mediaType">([^<]+)</)?.[1];
    return !mediaType || mediaType === "CD";
  });

  const sourceHtml = cdBlocks.length > 0 ? cdBlocks.join("") : html;
  const itemPattern = /<div class="TrackListItem">([\s\S]*?)(?=<div class="TrackListItem">|<\/div><\/div><\/div><\/div><\/div>)/g;
  let match;
  while ((match = itemPattern.exec(sourceHtml))) {
    const itemHtml = match[1];
    const titleMatch = itemHtml.match(
      /<div class="TrackListItem__title">([\s\S]*?)<\/div><div class="paragraph-sm TrackListItem__duration">/
    );
    if (!titleMatch) continue;
    const title = cleanTrackTitle(stripTags(titleMatch[1]));
    if (!looksLikeSong(title)) continue;

    const credit = {};
    const spanValue = (label) => {
      const span = itemHtml.match(
        new RegExp(`<span class="pr-\\[1em\\]">${label}：<!-- -->([\\s\\S]*?)<\\/span>`)
      )?.[1];
      return span ? stripTags(span) : undefined;
    };
    const lyricist = spanValue("作詞");
    const composer = spanValue("作曲");
    const arranger = spanValue("編曲");
    if (lyricist) credit.lyricist = lyricist;
    if (composer) credit.composer = composer;
    if (arranger) credit.arranger = arranger;
    items.push({ title, credit });
  }
  return items;
};

const getReleaseTracks = async (item) => {
  const html = await fetchText(`${DETAIL_BASE}${item.link}`);
  const tracks = [];
  const credits = {};

  for (const track of extractTrackItems(html)) {
    if (!tracks.includes(track.title)) tracks.push(track.title);
    if (
      track.credit.lyricist ||
      track.credit.composer ||
      track.credit.arranger
    ) {
      credits[track.title] = { ...(credits[track.title] ?? {}), ...track.credit };
    }
  }

  if (tracks.length === 0) {
    for (const track of splitTitleFallback(item.title)) {
      if (!tracks.includes(track)) tracks.push(track);
    }
  }

  return { tracks, credits };
};

const importGroup = async (group, allItems) => {
  const sourceItems = allItems
    .filter((item) => item.artistsSearch?.includes(group.officialGroupId))
    .filter((item) =>
      (item.category ?? []).some((category) => TARGET_CATEGORIES.has(category))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const releases = [];
  const credits = {};

  for (const item of sourceItems) {
    const { tracks, credits: releaseCredits } = await getReleaseTracks(item);
    if (tracks.length === 0) continue;

    Object.assign(credits, releaseCredits);
    releases.push({
      id: `${group.idPrefix}-${item.id}`,
      title: item.title,
      type: releaseType(item.category ?? []),
      typeLabel: item.categoryLabel,
      releaseDate: item.date,
      tracks,
      lineup: [],
      links: {
        official: `${DETAIL_BASE}${item.link}`,
      },
      ...(absoluteImage(item.image?.url) ? { cover: absoluteImage(item.image.url) } : {}),
    });
  }

  const dir = path.join("data", "groups", group.slug);
  await fs.writeFile(
    path.join(dir, "releases.json"),
    `${JSON.stringify(releases, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(dir, "credits.json"),
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(credits).sort(([a], [b]) => a.localeCompare(b, "ja"))
      ),
      null,
      2
    )}\n`
  );

  return { slug: group.slug, releases: releases.length, songs: new Set(releases.flatMap((r) => r.tracks)).size };
};

const main = async () => {
  const versionDir = await getVersionDir();
  const allItems = [];

  for (let year = 1998; year <= 2026; year++) {
    const url = `${JSON_BASE}/${versionDir}/${year}_releases.json`;
    const json = await fetchJson(url);
    allItems.push(...(json.items ?? []));
  }

  const requestedSlugs = new Set(process.argv.slice(2));
  const targetGroups = requestedSlugs.size
    ? GROUPS.filter((group) => requestedSlugs.has(group.slug))
    : GROUPS;
  if (requestedSlugs.size && targetGroups.length !== requestedSlugs.size) {
    const known = new Set(GROUPS.map((group) => group.slug));
    const unknown = [...requestedSlugs].filter((slug) => !known.has(slug));
    throw new Error(`Unknown group slug: ${unknown.join(", ")}`);
  }

  const results = [];
  for (const group of targetGroups) {
    results.push(await importGroup(group, allItems));
  }

  console.table(results);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
