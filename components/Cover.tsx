import type { Release } from "@/app/types";
import { TYPE_HEX } from "@/app/colors";

const firstChar = (title: string) => {
  const cleaned = title
    .split(/\s*\/\s*/)[0]
    .replace(/[「」"]/g, "")
    .trim();
  return cleaned.charAt(0) || "♪";
};

export default function Cover({
  release,
  size = 64,
}: {
  release: Release;
  size?: number;
}) {
  if (release.cover) {
    return (
      <img
        src={release.cover}
        alt={`${release.title} ジャケット`}
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-cover ring-1 ring-border"
        style={{ width: size, height: size }}
      />
    );
  }

  const tint = TYPE_HEX[release.type];

  return (
    <div
      aria-hidden
      className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-border"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${tint}33 0%, ${tint}88 100%)`,
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-sm"
        style={{ fontSize: size * 0.45 }}
      >
        {firstChar(release.title)}
      </div>
    </div>
  );
}
