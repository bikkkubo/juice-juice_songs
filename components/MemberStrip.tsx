"use client";

import Link from "next/link";
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
  groupSlug?: string;
};

export default function MemberStrip({
  members,
  activeMember,
  onSelect,
  groupSlug = "juice-juice",
}: Props) {
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
            groupSlug={groupSlug}
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
            groupSlug={groupSlug}
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
  groupSlug,
}: {
  member: Member;
  variant: "current" | "past";
  isActive: boolean;
  onSelect: (name: string | null) => void;
  groupSlug: string;
}) {
  const color = memberColor(member.color);
  const isCurrent = variant === "current";

  const base = isCurrent
    ? "bg-white text-ink"
    : "bg-surface text-ink-weak";

  return (
    <span
      className={`group inline-flex items-stretch overflow-hidden rounded-full border transition ${base} ${
        isActive
          ? "border-accent ring-2 ring-accent/40"
          : "border-border hover:border-ink/30"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(isActive ? null : member.name)}
        aria-pressed={isActive}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm"
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
      <Link
        href={`/${groupSlug}/members/${encodeURIComponent(member.name)}`}
        aria-label={`${member.name}の詳細ページ`}
        className="flex items-center border-l border-border px-2 text-[11px] text-ink-weak transition hover:bg-accent hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        →
      </Link>
    </span>
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
