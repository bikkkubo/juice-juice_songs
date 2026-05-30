"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  groupSlug: string;
  groupName: string;
};

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function LiveVideoSubmissionButton({ groupSlug, groupName }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [performanceName, setPerformanceName] = useState("");
  const [startPosition, setStartPosition] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = () => {
    if (state === "sending") return;
    setOpen(false);
    setState("idle");
    setMessage("");
  };

  const submit = async () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setState("error");
      setMessage("URLを入力してください");
      return;
    }
    if (!performanceName.trim()) {
      setState("error");
      setMessage("公演名を入力してください");
      return;
    }

    setState("sending");
    setMessage("");
    const response = await fetch("/api/live-video-submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        groupSlug,
        groupName,
        url: cleanUrl,
        performanceName: performanceName.trim(),
        startPosition: startPosition.trim(),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      setMessage("送信できませんでした。URLを確認してもう一度試してください。");
      return;
    }

    setState("sent");
    setUrl("");
    setPerformanceName("");
    setStartPosition("");
    setMessage("送信しました。管理者が確認します。");
  };

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-ink/45 px-4 py-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-video-submission-title"
          >
            <div className="flex min-h-full items-start justify-center py-2 sm:items-center">
              <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
                      LIVE VIDEO
                    </p>
                    <h2
                      id="live-video-submission-title"
                      className="text-lg font-bold leading-tight text-ink"
                    >
                      ライブ映像URLを申請
                    </h2>
                    <p className="mt-1 text-xs text-ink-weak">{groupName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full border border-border bg-white px-2 py-1 text-xs font-semibold text-ink-weak transition hover:border-ink/30 hover:text-ink"
                  >
                    閉じる
                  </button>
                </div>

                <label className="block text-xs font-semibold text-ink">
                  URL
                  <input
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      if (state !== "sending") setState("idle");
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    inputMode="url"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-accent"
                  />
                </label>

                <label className="mt-3 block text-xs font-semibold text-ink">
                  公演名
                  <input
                    value={performanceName}
                    onChange={(event) => {
                      setPerformanceName(event.target.value);
                      if (state !== "sending") setState("idle");
                    }}
                    placeholder="例: BEYOOOOONDS CONCERT TOUR 2026 春"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-accent"
                  />
                </label>

                <label className="mt-3 block text-xs font-semibold text-ink">
                  開始位置 任意
                  <input
                    value={startPosition}
                    onChange={(event) => setStartPosition(event.target.value)}
                    placeholder="例: 12:34 / 1:02:15"
                    inputMode="text"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-accent"
                  />
                </label>

                {message && (
                  <p
                    className={
                      state === "sent"
                        ? "mt-3 text-xs font-semibold text-accent"
                        : "mt-3 text-xs font-semibold text-red-600"
                    }
                  >
                    {message}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={state === "sending"}
                    className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state === "sending" ? "送信中" : "送信"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border bg-white px-2.5 py-1 font-semibold text-ink transition hover:border-accent hover:text-accent"
      >
        映像URL申請
      </button>
      {modal}
    </>
  );
}
