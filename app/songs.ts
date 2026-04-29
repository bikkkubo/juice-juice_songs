import releasesData from "@/data/releases.json";
import creditsData from "@/data/credits.json";
import type { Release, SongCredits } from "./types";

const credits = creditsData as Record<string, SongCredits>;

export const getCredits = (canonical: string): SongCredits | null => {
  const c = credits[canonical];
  if (!c) return null;
  if (!c.lyricist && !c.composer && !c.arranger) return null;
  return c;
};

const normalizePunct = (s: string): string =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/！/g, "!")
    .replace(/？/g, "?")
    .replace(/～/g, "〜")
    .replace(/[「」『』]/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*〜\s*/g, "〜")
    .replace(/([!?])\s+(?=[^\x00-\x7f])/g, "$1")
    .replace(/\s+/g, " ")
    .normalize("NFC");

export const canonicalizeTitle = (title: string): string => {
  let s = normalizePunct(title.trim());
  // Strip all parenthetical groups (version markers, furigana, etc.)
  s = s.replace(/[(（][^)）]*[)）]/g, "");
  // Strip dashed subtitle " -xxx-"
  s = s.replace(/\s+-[^-]+-$/u, "");
  // Strip year suffix like " 2018"
  s = s.replace(/\s+\d{4}$/u, "");
  return s.replace(/\s+/g, " ").trim();
};

export type SongAppearance = {
  release: Release;
  trackName: string;
  isCanonicalForm: boolean;
};

export type Song = {
  canonical: string;
  appearances: SongAppearance[];
};

const buildIndex = (): Map<string, Song> => {
  const map = new Map<string, Song>();

  const sorted = (releasesData as Release[])
    .slice()
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  for (const r of sorted) {
    for (const t of r.tracks) {
      const canon = canonicalizeTitle(t);
      if (!canon) continue;
      let song = map.get(canon);
      if (!song) {
        song = { canonical: canon, appearances: [] };
        map.set(canon, song);
      }
      song.appearances.push({
        release: r,
        trackName: t,
        isCanonicalForm: t === canon,
      });
    }
  }

  return map;
};

const songIndex = buildIndex();

export const getAllSongs = (): Song[] => Array.from(songIndex.values());

export const getSong = (canonical: string): Song | null =>
  songIndex.get(canonical) ?? null;
