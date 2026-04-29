import type { Member } from "@/app/types";

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
          <span
            key={m.name}
            className="rounded-full bg-type-single/12 px-3 py-1 text-sm font-medium text-type-single"
            style={{
              backgroundColor: "rgba(235, 90, 140, 0.10)",
            }}
            title={`${m.color} / 加入: ${m.joined}`}
          >
            {m.name}
          </span>
        ))}
      </Group>

      <Group title="歴代メンバー" count={past.length}>
        {past.map((m) => (
          <span
            key={m.name}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-sm text-ink-weak"
            title={`${m.color} / ${m.joined} 〜 ${m.left}`}
          >
            <span>{m.name}</span>
            <span className="text-[10px] font-mono">
              {formatDate(m.joined)}–{m.left ? formatDate(m.left) : ""}
            </span>
          </span>
        ))}
      </Group>
    </div>
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
