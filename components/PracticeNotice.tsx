export default function PracticeNotice() {
  return (
    <aside className="border-b border-border bg-accent/5">
      <div className="mx-auto max-w-page px-5 py-3 text-xs leading-relaxed text-ink-weak">
        <p className="font-semibold text-ink">コール練習について</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>メンバーコールは、参照している動画・音源時点のものです。</li>
          <li>
            練習用として、初心者向けのオーソドックスなコールのみを掲載しています。
          </li>
        </ul>
      </div>
    </aside>
  );
}
