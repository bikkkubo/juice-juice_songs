export const MEMBER_COLOR_HEX: Record<string, string> = {
  ピーチ: "#FFC1E0",
  りんご: "#FF6881",
  レモン: "#FFE066",
  オレンジ: "#FF9F40",
  ブドウ: "#7C3AED",
  メロン: "#A8E063",
  ミディアムブルー: "#5B7FFF",
  ホットピンク: "#FF4D8F",
  ピンク: "#FF8FC1",
  ロイヤルブルー: "#3B5FCF",
  白: "#FFFFFF",
  ライトブルー: "#9CCFEC",
  ライトパープル: "#C9B0FF",
  デイジー: "#FFEB7A",
  パープル: "#7C4DFF",
  ミントグリーン: "#9FE6B4",
  ピュアレッド: "#E8222F",
  ブライトグリーン: "#5EE068",
};

export const memberColor = (name: string) =>
  MEMBER_COLOR_HEX[name] ?? "#cccccc";

export const TYPE_HEX: Record<
  "indie" | "single" | "album" | "digital" | "unreleased",
  string
> = {
  indie: "#A78BFA",
  single: "#EB5A8C",
  album: "#22C55E",
  digital: "#38BDF8",
  unreleased: "#64748B",
};
