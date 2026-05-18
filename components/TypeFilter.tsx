"use client";

import type { ReleaseType } from "@/app/types";

type Item = { type: ReleaseType; label: string; chipClass: string };

const TYPES: Item[] = [
  { type: "single", label: "シングル", chipClass: "bg-type-single" },
  { type: "album", label: "アルバム", chipClass: "bg-type-album" },
  { type: "indie", label: "インディーズ", chipClass: "bg-type-indie" },
  { type: "digital", label: "配信", chipClass: "bg-type-digital" },
  { type: "unreleased", label: "未音源化", chipClass: "bg-type-unreleased" },
];

type Props = {
  active: ReleaseType[];
  counts: Record<ReleaseType, number>;
  onToggle: (type: ReleaseType) => void;
  onClear: () => void;
};

export default function TypeFilter({
  active,
  counts,
  onToggle,
  onClear,
}: Props) {
  const isAll = active.length === 0;
  const total = TYPES.reduce((sum, t) => sum + (counts[t.type] ?? 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={onClear}
        className={
          isAll
            ? "rounded-full border border-accent bg-accent px-3 py-1 font-mono text-xs text-white"
            : "rounded-full border border-border bg-white px-3 py-1 font-mono text-xs text-ink-weak hover:border-accent hover:text-accent"
        }
      >
        ALL <span className="opacity-70">{total}</span>
      </button>
      {TYPES.map(({ type, label, chipClass }) => {
        const isActive = active.includes(type);
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            disabled={count === 0}
            className={
              isActive
                ? "inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-xs text-bg"
                : "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs text-ink-weak hover:border-ink/40 hover:text-ink disabled:opacity-40"
            }
          >
            <span
              aria-hidden
              className={`inline-block h-2 w-2 rounded-full ${chipClass}`}
            />
            <span>{label}</span>
            <span className="font-mono opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
