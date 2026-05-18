export type SetlistTrackSource = "ライブ映像あり" | "YouTube Music" | "音源未設定";

export type SetlistTrack = {
  title: string;
  source: SetlistTrackSource;
  videoId?: string;
  note?: string;
  kind?: "song" | "note";
};

export type LiveSetlist = {
  id: string;
  title: string;
  note: string;
  date?: string;
  sortDate?: string;
  venue?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  tracks: SetlistTrack[];
};

export const liveSetlists: LiveSetlist[] = [
  {
    id: "up-to-11-2026",
    title: "Juice=Juice LIVE TOUR 2026 UP TO 11",
    note: "2026年春ライブツアーの基本セトリです。2026年4月18日 Zepp Namba(OSAKA) 1公演目の参戦記録を元に登録しています。",
    date: "2026.04.17 - 2026.05.27",
    sortDate: "2026.05.27",
    venue: "ツアー各会場",
    sourceUrl: "https://note.com/tsunechan0707/n/ne198dcf909c1",
    sourceLabel: "参戦記録を開く",
    tracks: [
      { title: "BLOODY BULLET", source: "音源未設定" },
      {
        title: "ひとりで生きられそうって それってねえ、褒めているの?",
        source: "音源未設定",
      },
      { title: "CHOICE & CHANCE", source: "ライブ映像あり", videoId: "a1MDCj0T0c4" },
      { title: "GIRLS BE AMBITIOUS! 2026", source: "音源未設定" },
      { title: "好きって言ってよ", source: "音源未設定" },
      { title: "四の五の言わず颯と別れてあげた", source: "音源未設定" },
      { title: "トウキョウ・ブラー", source: "ライブ映像あり", videoId: "1blvz_OhPSI" },
      { title: "Never Never Surrender", source: "音源未設定" },
      {
        title: "私が言う前に抱きしめなきゃね",
        source: "音源未設定",
        note: "ここからの3曲は公演内でメンバーをリレーする構成。",
      },
      { title: "イジワルしないで 抱きしめてよ", source: "音源未設定" },
      { title: "ロマンスの途中", source: "音源未設定" },
      { title: "禁断少女", source: "音源未設定" },
      { title: "Fiesta! Fiesta!", source: "音源未設定" },
      { title: "甘えんな", source: "音源未設定" },
      { title: "ナイモノラブ", source: "音源未設定" },
      { title: "プラトニック・プラネット", source: "音源未設定" },
      { title: "プライド・ブライト", source: "音源未設定" },
      { title: "盛れ!ミ・アモーレ", source: "音源未設定" },
      { title: "Magic of Love", source: "音源未設定" },
      { title: "未来へ、さあ走り出せ!", source: "音源未設定" },
    ],
  },
  {
    id: "triangrooove2-special-2024",
    title: "Juice=Juice Concert Tour 2024 TRIANGROOOVE2 Special",
    note: "2024年11月19日 日本武道館公演のセトリです。",
    date: "2024.11.19",
    sortDate: "2024.11.19",
    venue: "日本武道館",
    sourceUrl: "https://orekoko.site/231/",
    sourceLabel: "出典を開く",
    tracks: [
      { title: "トウキョウ・ブラー", source: "ライブ映像あり", videoId: "1blvz_OhPSI" },
      { title: "プラトニック・プラネット", source: "音源未設定" },
      { title: "今夜はHearty Party", source: "音源未設定" },
      { title: "POPPIN’ LOVE", source: "音源未設定" },
      { title: "禁断少女", source: "音源未設定" },
      { title: "イニミニマニモ〜恋のライバル宣言〜", source: "音源未設定" },
      { title: "ライバル", source: "音源未設定" },
      { title: "地団駄ダンス", source: "音源未設定" },
      { title: "ポップミュージック", source: "音源未設定" },
      { title: "あばれてっか?! ハヴアグッタイ", source: "音源未設定" },
      { title: "This is 運命", source: "音源未設定" },
      { title: "ノクチルカ", source: "音源未設定" },
      { title: "全部賭けてGO!!", source: "音源未設定" },
      { title: "Va-Va-Voom", source: "音源未設定" },
      { title: "情熱エクスタシー", source: "音源未設定" },
      { title: "Future Smile", source: "音源未設定" },
      { title: "Never Never Surrender", source: "音源未設定" },
      { title: "STAGE〜アガッてみな〜", source: "音源未設定" },
      { title: "ナイモノラブ", source: "音源未設定" },
      { title: "GIRLS BE AMBITIOUS!", source: "音源未設定" },
      { title: "プライド・ブライト", source: "音源未設定" },
      { title: "Fiesta! Fiesta!", source: "音源未設定" },
      { title: "がんばれないよ", source: "音源未設定" },
      { title: "この世界は捨てたもんじゃない", source: "音源未設定" },
      { title: "Goal〜明日はあっちだよ〜", source: "音源未設定" },
    ],
  },
  {
    id: "crimson-azure-special-2025",
    title: "Juice=Juice Concert Tour 2025 Crimson×Azure Special",
    note: "2025年6月23日 日本武道館公演のセトリです。",
    date: "2025.06.23",
    sortDate: "2025.06.23",
    venue: "日本武道館",
    sourceUrl: "https://orekoko.site/860/",
    sourceLabel: "出典を開く",
    tracks: [
      { title: "あばれてっか?! ハヴアグッタイ", source: "音源未設定" },
      { title: "Va-Va-Voom", source: "音源未設定" },
      { title: "ナイモノラブ", source: "音源未設定" },
      { title: "初恋の亡霊", source: "音源未設定" },
      { title: "風に吹かれて", source: "音源未設定" },
      {
        title: "ひとりで生きられそうって それってねえ、褒めているの?",
        source: "音源未設定",
      },
      { title: "DOWN TOWN", source: "音源未設定" },
      { title: "Vivid Midnight", source: "音源未設定" },
      { title: "プラトニック・プラネット", source: "音源未設定" },
      { title: "雨の中の口笛", source: "音源未設定" },
      { title: "Mon Amour", source: "音源未設定" },
      { title: "大人の事情", source: "音源未設定" },
      { title: "Next is you!", source: "音源未設定" },
      { title: "選ばれし私達", source: "音源未設定" },
      { title: "明日やろうはバカやろう", source: "音源未設定" },
      { title: "トウキョウ・ブラー", source: "ライブ映像あり", videoId: "1blvz_OhPSI" },
      { title: "五月雨美女がさ乱れる", source: "音源未設定" },
      { title: "CHOICE & CHANCE", source: "ライブ映像あり", videoId: "a1MDCj0T0c4" },
      { title: "プライド・ブライト", source: "音源未設定" },
      { title: "GIRLS BE AMBITIOUS!", source: "音源未設定" },
      { title: "Fiesta! Fiesta!", source: "音源未設定" },
      { title: "Magic of Love", source: "音源未設定" },
      { title: "生まれたてのBaby Love", source: "音源未設定" },
      { title: "如雨露", source: "音源未設定" },
      { title: "G.O.A.T.", source: "音源未設定" },
    ],
  },
  {
    id: "queen-of-hearts-2025",
    title: "Juice=Juice LIVE TOUR 2025 Queen of Hearts",
    note: "2025年秋ライブツアーの基本セトリです。Queenソロパフォーマンス枠は公演ごとに曲が変わります。",
    date: "2025.09.17 - 2025.11.08",
    sortDate: "2025.11.08",
    venue: "ツアー各会場",
    sourceUrl: "https://orekoko.site/1150/",
    sourceLabel: "出典を開く",
    tracks: [
      { title: "盛れ!ミ・アモーレ", source: "音源未設定" },
      { title: "ナイモノラブ", source: "音源未設定" },
      { title: "STAGE〜アガッてみな〜", source: "音源未設定" },
      { title: "素直に甘えて", source: "音源未設定" },
      { title: "イジワルしないで 抱きしめてよ", source: "音源未設定" },
      { title: "私が言う前に抱きしめなきゃね", source: "音源未設定" },
      { title: "四の五の言わず颯と別れてあげた", source: "音源未設定" },
      { title: "トウキョウ・ブラー", source: "ライブ映像あり", videoId: "1blvz_OhPSI" },
      { title: "プライド・ブライト", source: "音源未設定" },
      {
        title: "ひとりで生きられそうって それってねえ、褒めているの?",
        source: "音源未設定",
      },
      { title: "Va-Va-Voom", source: "音源未設定" },
      {
        title: "Queenソロパフォーマンス",
        source: "音源未設定",
        kind: "note",
        note: "公演ごとに差し替え。例: カラダだけが大人になったんじゃない / 好きって言ってよ / TOKYOグライダー / 甘えんな など",
      },
      { title: "BLOODY BULLET", source: "音源未設定" },
      { title: "プラトニック・プラネット", source: "音源未設定" },
      { title: "全部賭けてGO!!", source: "音源未設定" },
      { title: "あばれてっか?! ハヴアグッタイ", source: "音源未設定" },
      { title: "明日やろうはバカやろう", source: "音源未設定" },
      { title: "CHOICE & CHANCE", source: "ライブ映像あり", videoId: "a1MDCj0T0c4" },
      { title: "Goal〜明日はあっちだよ〜", source: "音源未設定" },
      { title: "KEEP ON 上昇志向!!", source: "音源未設定" },
    ],
  },
  {
    id: "juice-juice-day-2025-special-live",
    title: "スペシャルライブ2025 ～10月10日はJuice=Juiceの日～",
    note: "YouTube Musicのライブ音源プレイリストを元にしたコール練習用セトリです。",
    date: "2025.10.10",
    sortDate: "2025.10.10",
    venue: "ライブ音源",
    sourceUrl:
      "https://music.youtube.com/playlist?list=OLAK5uy_kyCqrDNJoYCDEqGeM3G4bSMBbV6JN8HrI",
    sourceLabel: "YouTube Musicで開く",
    tracks: [
      {
        title: "四の五の言わず颯と別れてあげた",
        source: "YouTube Music",
        videoId: "x6IpZQmiUl0",
      },
      {
        title: "ひとりで生きられそうって それってねえ、褒めているの?",
        source: "YouTube Music",
        videoId: "-l3hTH4M7EQ",
      },
      {
        title: "イジワルしないで 抱きしめてよ",
        source: "YouTube Music",
        videoId: "sVNsd-Wn_UU",
      },
      {
        title: "素直に甘えて",
        source: "YouTube Music",
        videoId: "NsfJvn7-aDM",
      },
      { title: "微炭酸", source: "YouTube Music", videoId: "oMgjwi9ssHI" },
      { title: "ノクチルカ", source: "YouTube Music", videoId: "uSKuScmtrfE" },
      {
        title: "雨の中の口笛",
        source: "YouTube Music",
        videoId: "ltsS3O29aM4",
      },
      { title: "愛・愛・傘", source: "YouTube Music", videoId: "6Y2X6RxYnYA" },
      {
        title: "TOKYOグライダー",
        source: "YouTube Music",
        videoId: "LZlLhbc-ARI",
      },
      {
        title: "伊達じゃないよ うちの人生は",
        source: "YouTube Music",
        videoId: "JQ270gg4PPM",
      },
      {
        title: "プライド・ブライト",
        source: "YouTube Music",
        videoId: "sjz8xSJdaUc",
      },
      { title: "Va-Va-Voom", source: "YouTube Music", videoId: "xdw3rkeSJlA" },
      {
        title: "盛れ!ミ・アモーレ",
        source: "YouTube Music",
        videoId: "dk_sbTrOvbw",
      },
      {
        title: "この世界は捨てたもんじゃない",
        source: "YouTube Music",
        videoId: "ku_JoTRHYpU",
      },
      {
        title: "Goal〜明日はあっちだよ〜",
        source: "YouTube Music",
        videoId: "QYiMYubszU8",
      },
    ],
  },
];

export const getLiveSetlistsByLatest = (): LiveSetlist[] =>
  liveSetlists
    .slice()
    .sort((a, b) => (b.sortDate ?? b.date ?? "").localeCompare(a.sortDate ?? a.date ?? ""));

export const callRegisteredSongs: SetlistTrack[] = Array.from(
  new Map(
    getLiveSetlistsByLatest()
      .flatMap((setlist) => setlist.tracks)
      .filter((track) => track.kind !== "note")
      .map((track) => [track.title, track])
  ).values()
);
