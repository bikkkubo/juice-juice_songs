export type CallTemplate = {
  phrase: string;
  timing: string;
  note: string;
};

export const GENERAL_TEMPLATES: CallTemplate[] = [
  {
    phrase: "オイ！",
    timing: "間奏 / ダンスパート",
    note: "汎用。リズムに合わせて短く入れる。",
  },
  {
    phrase: "ウーッ！",
    timing: "煽り / ブレイク前",
    note: "次のコールや展開に向けた溜めの掛け声。",
  },
  {
    phrase: "オイ！×4",
    timing: "間奏 / 裏拍",
    note: "4回まとまって入れる定番の短いコール。",
  },
];

const toMemberTemplates = (names: string[]): CallTemplate[] =>
  names.map((name) => ({
    phrase: name,
    timing: "メンバー歌割り / 決めパート",
    note: "メンバー名コール。",
  }));

export const GROUP_MEMBER_CALLS: Record<string, string[]> = {
  "juice-juice": [
    "るるちゃん",
    "ゆめちゃん",
    "りあい",
    "れいれい",
    "いちか",
    "りさち",
    "きさき",
    "さくら",
    "あーたん",
    "みふちゃん",
    "にいな",
  ],
  angerme: [
    "れいら",
    "りんちゃん",
    "ケロちゃん",
    "しおん",
    "わかにゃ",
    "ゆきちゃん",
    "ゆっぴょん",
    "はなな",
    "もっち",
  ],
  "morning-musume": [
    "さくら",
    "のなか",
    "まりあ",
    "ほまれ",
    "めいちゃん",
    "らいりー",
    "はるか",
    "ゲッター",
    "めいさ",
    "はなちゃん",
  ],
  "ocha-norma": [
    "まどか",
    "るりちゃん",
    "きらら",
    "ななみ",
    "なつめ",
    "みくちゃん",
    "ももちゃん",
    "ろこちゃん",
  ],
  "tsubaki-factory": [
    "あんみぃ",
    "みずほ",
    "さおり",
    "まおぴん",
    "ゆうみ",
    "まりん",
    "るのちゃん",
    "みはね",
    "ゆうちゃん",
    "ふうちゃん",
    "いつき",
  ],
  "rosy-chronicle": [
    "ほのか",
    "ひのは",
    "かりん",
    "あやな",
    "はすみ",
    "ユリヤ",
    "はなちゃん",
    "れなちゃん",
    "ゆめちゃん",
  ],
  beyooooonds: [
    "しおりん",
    "さやりん",
    "くるみ",
    "こころ",
    "みいみ",
    "ももひ",
    "みよちゃん",
    "ほのか",
    "うーたん",
    "未定",
  ],
};

export const getMemberTemplates = (groupSlug = "juice-juice"): CallTemplate[] =>
  toMemberTemplates(GROUP_MEMBER_CALLS[groupSlug] ?? GROUP_MEMBER_CALLS["juice-juice"]);

export const MEMBER_TEMPLATES: CallTemplate[] = toMemberTemplates([
  "るるちゃん",
  "れいれい",
  "ゆめちゃん",
  "りあい",
  "いちか",
  "りさち",
  "きさき",
  "さくら",
  "あーたん",
  "みふちゃん",
  "にいな",
]);
