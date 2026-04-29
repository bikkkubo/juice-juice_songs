type Props = {
  releaseCount: number;
  memberCount: number;
};

export default function Header({ releaseCount, memberCount }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-5 py-3">
        <h1 className="text-base font-bold text-ink">Juice=Juice 楽曲年表</h1>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-weak">
          <Chip label={`${releaseCount} releases`} />
          <Chip label={`${memberCount} members`} />
          <Chip label="2013–Now" />
        </div>
      </div>
    </header>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2 py-0.5">
      {label}
    </span>
  );
}
