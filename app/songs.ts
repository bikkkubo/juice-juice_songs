import releasesData from "@/data/releases.json";
import creditsData from "@/data/credits.json";
import aliasesData from "@/data/aliases.json";
import type { Release, SongCredits } from "./types";

const credits = creditsData as Record<string, SongCredits>;
const aliases = aliasesData as Record<string, string>;

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
  if (s === "GIRLS BE AMBITIOUS! 2026") return s;
  // Strip all parenthetical groups (version markers, furigana, etc.)
  s = s.replace(/[(（][^)）]*[)）]/g, "");
  // Strip dashed subtitle " -xxx-"
  s = s.replace(/\s+-[^-]+-$/u, "");
  // Strip year suffix like " 2018"
  s = s.replace(/\s+\d{4}$/u, "");
  s = s.replace(/\s+/g, " ").trim();
  // Resolve alias (different titles for the same song)
  return aliases[s] ?? s;
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

const SONG_SLUG_OVERRIDES: Record<string, string> = {
  "盛れ!ミ・アモーレ": "more-mi-amore",
  "四の五の言わず颯と別れてあげた": "shinogono-iwazu-satto-wakarete-ageta",
  "GIRLS BE AMBITIOUS! 2026": "girls-be-ambitious-2026",
  "プラトニック・プラネット": "platonic-planet",
  "BLOODY BULLET": "bloody-bullet",
  "私が言う前に抱きしめなきゃね": "watashi-ga-iu-mae-ni-dakishimenakya-ne",
  "甘えんな": "amaenna",
  "ひとりで生きられそうって それってねえ、褒めているの?":
    "hitoride-ikirare-sou-tte-sorette-nee-hometeiru-no",
  "Fiesta! Fiesta!": "fiesta-fiesta",
  "プライド・ブライト": "pride-bright",
  "イジワルしないで 抱きしめてよ": "ijiwaru-shinaide-dakishimete-yo",
  "素直に甘えて": "sunao-ni-amaete",
  "微炭酸": "bitansan",
  "ノクチルカ": "noctiluca",
  "雨の中の口笛": "ame-no-naka-no-kuchibue",
  "愛・愛・傘": "ai-ai-gasa",
  "TOKYOグライダー": "tokyo-glider",
  "伊達じゃないよ うちの人生は": "date-janai-yo-uchi-no-jinsei-wa",
  "Va-Va-Voom": "va-va-voom",
  "この世界は捨てたもんじゃない": "kono-sekai-wa-suteta-mon-janai",
  "Goal〜明日はあっちだよ〜": "goal-ashita-wa-acchi-dayo",
  "トウキョウ・ブラー": "tokyo-blur",
  "今夜はHearty Party": "konya-wa-hearty-party",
  "POPPIN’ LOVE": "poppin-love",
  "禁断少女": "kindan-shoujo",
  "イニミニマニモ〜恋のライバル宣言〜": "eeny-meeny-miny-moe-koi-no-rival-sengen",
  "ライバル": "rival",
  "地団駄ダンス": "jidanda-dance",
  "ポップミュージック": "pop-music",
  "あばれてっか?! ハヴアグッタイ": "abarete-kka-have-a-good-time",
  "This is 運命": "this-is-unmei",
  "全部賭けてGO!!": "zenbu-kakete-go",
  "情熱エクスタシー": "jounetsu-ecstasy",
  "Future Smile": "future-smile",
  "Never Never Surrender": "never-never-surrender",
  "STAGE〜アガッてみな〜": "stage-agatte-mina",
  "ナイモノラブ": "naimono-love",
  "GIRLS BE AMBITIOUS!": "girls-be-ambitious",
  "がんばれないよ": "ganbarenai-yo",
  "初恋の亡霊": "hatsukoi-no-bourei",
  "風に吹かれて": "kaze-ni-fukarete",
  "DOWN TOWN": "down-town",
  "Vivid Midnight": "vivid-midnight",
  "Mon Amour": "mon-amour",
  "大人の事情": "otona-no-jijou",
  "Next is you!": "next-is-you",
  "選ばれし私達": "erabareshi-watashitachi",
  "明日やろうはバカやろう": "ashita-yarou-wa-baka-yarou",
  "五月雨美女がさ乱れる": "samidare-bijo-ga-samidare",
  "CHOICE & CHANCE": "choice-and-chance",
  "Magic of Love": "magic-of-love",
  "未来へ、さあ走り出せ!": "mirai-e-saa-hashiridase",
  "生まれたてのBaby Love": "umaretate-no-baby-love",
  "如雨露": "joro",
  "G.O.A.T.": "goat",
  "KEEP ON 上昇志向!!": "keep-on-joushou-shikou",
};

const hashTitle = (title: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

export const songSlug = (canonical: string): string => {
  const override = SONG_SLUG_OVERRIDES[canonical];
  if (override) return override;

  const ascii = canonical
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || `song-${hashTitle(canonical)}`;
};

export const songPath = (canonical: string): string => `/songs/${songSlug(canonical)}`;

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

const slugIndex = new Map(
  Array.from(songIndex.values()).map((song) => [songSlug(song.canonical), song])
);

export const getAllSongs = (): Song[] => Array.from(songIndex.values());

export const getSong = (canonical: string): Song | null =>
  songIndex.get(canonical) ?? null;

export const getSongByParam = (param: string): Song | null => {
  const decoded = decodeURIComponent(param);
  return slugIndex.get(decoded) ?? getSong(decoded);
};
