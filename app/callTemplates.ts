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

export const MEMBER_TEMPLATES: CallTemplate[] = [
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
].map((name) => ({
  phrase: name,
  timing: "メンバー歌割り / 決めパート",
  note: "メンバー名コール。",
}));
