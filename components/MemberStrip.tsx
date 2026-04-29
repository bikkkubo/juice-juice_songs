import type { Member } from "@/app/types";
import { memberColor } from "@/app/colors";

const formatDate = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${y}.${m}`;
};

export default function MemberStrip({ members }: { members: Member[] }) {
  const current = members.filter((m) => m.left === null);
  const past = members.filter((m) => m.left !== null);

  return (
    <div className="space-y-5">
      <Group title="現メンバー" count={current.length}>
        {current.map((m) => (
          <MemberPill key={m.name} member={m} variant="current" />
        ))}
      </Group>

      <Group title="歴代メンバー" count={past.length}>
        {past.map((m) => (
          <MemberPill key={m.name} member={m} variant="past" />
        ))}
      </Group>
    </div>
  );
}

function MemberPill({
  member,
  variant,
}: {
  member: Member;
  variant: "current" | "past";
}) {
  const color = memberColor(member.color);
  const isCurrent = variant === "current";
  return (
    <span
      className={
        isCurrent
          ? "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-sm text-ink"
          : "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-ink-weak"
      }
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
