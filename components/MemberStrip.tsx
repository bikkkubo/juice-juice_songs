"use client";

import type { Member } from "@/app/types";
import { memberColor } from "@/app/colors";

const formatDate = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${y}.${m}`;
};

type Props = {
  members: Member[];
  activeMember: string | null;
  onSelect: (name: string | null) => void;
};

export default function MemberStrip({ members, activeMember, onSelect }: Props) {
  const current = members.filter((m) => m.left === null);
  const past = members.filter((m) => m.left !== null);

  return (
    <div className="space-y-5">
      <Group title="現メンバー" count={current.length}>
        {current.map((m) => (
          <MemberPill
            key={m.name}
            member={m}
            variant="current"
            isActive={activeMember === m.name}
            onSelect={onSelect}
          />
        ))}
      </Group>

      <Group title="歴代メンバー" count={past.length}>
        {past.map((m) => (
          <MemberPill
            key={m.name}
            member={m}
            variant="past"
            isActive={activeMember === m.name}
            onSelect={onSelect}
          />
        ))}
      </Group>
    </div>
  );
}

function MemberPill({
  member,
  variant,
  isActive,
  onSelect,
}: {
  member: Member;
  variant: "current" | "past";
  isActive: boolean;
  onSelect: (name: string | null) => void;
}) {
  const color = memberColor(member.color);
  const isCurrent = variant === "current";

  const base = isCurrent
    ? "bg-white border-border text-ink"
    : "bg-surface border-border text-ink-weak";

  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? null : member.name)}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition ${base} ${
        isActive
          ? "ring-2 ring-accent ring-offset-1 ring-offset-bg"
          : "hover:border-ink/30"
      }`}
      title={`${member.color}${member.note ? " / " + member.note : ""} / ${member.joined}${member.left ? " 〜 " + member.left : "〜現在"}`}
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border"
        style={{ backgroundColor: color }}
      />
      <span>{member.name}</span>
      {!isCurrent && (
        <span className="font-mono text-[10px] text-ink-weak/80">
          {formatDate(member.joined)}–{member.left ? formatDate(member.left) : ""}
        </span>
      )}
    </button>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-ink-weak">
        <span>{title}</span>
        <span className="font-mono">{count}名</span>
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
