import type { Member } from "@/app/types";

const formatDate = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${y}.${m}`;
};

export default function MemberStrip({ members }: { members: Member[] }) {
  const current = members.filter((m) => m.left === null);
  const past = members.filter((m) => m.left !== null);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted">
          現メンバー ({current.length}名)
        </p>
        <div className="flex flex-wrap gap-2">
          {current.map((m) => (
            <span
              key={m.name}
              className="rounded-md border border-accent/30 bg-accent/5 px-3 py-1 text-sm text-ink"
              title={`${m.color} / 加入: ${m.joined}`}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted">
          歴代メンバー ({past.length}名)
        </p>
        <div className="flex flex-wrap gap-2">
          {past.map((m) => (
            <span
              key={m.name}
              className="rounded-md border border-line bg-white px-3 py-1 text-sm text-ink/60"
              title={`${m.color} / ${m.joined} 〜 ${m.left}`}
            >
              {m.name}
              <span className="ml-1 text-[10px] text-muted">
                {formatDate(m.joined)}–{m.left ? formatDate(m.left) : ""}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
