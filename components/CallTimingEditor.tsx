"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GENERAL_TEMPLATES, MEMBER_TEMPLATES } from "@/app/callTemplates";
import {
  EMPTY_TIMED_CALLS,
  buildYouTubeEmbedSrc,
  formatSeconds,
  getLiveVideo,
  loadTimedCalls,
  parseTimeInput,
  saveTimedCalls,
  songTemplateGroups,
  type AuthState,
  type TimedCall,
  type YouTubePlayer,
} from "./SongCallLab";

type EditorPlayer = YouTubePlayer & {
  getDuration: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const clampTime = (value: number) => Math.max(0, Number(value.toFixed(1)));

const defaultSongPhrase = (songTitle: string) => {
  const base = songTitle
    .replace(/\s*[(（][^)）]*[)）]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "曲名コール";
  return /[!！?？]$/.test(base) ? base : `${base}！`;
};

export default function CallTimingEditor({ songTitle }: { songTitle: string }) {
  const liveVideo = useMemo(() => getLiveVideo(songTitle), [songTitle]);
  const videoId = liveVideo?.videoId ?? "";
  const defaultCalls = liveVideo?.defaultCalls ?? EMPTY_TIMED_CALLS;
  const reactId = useId();
  const playerElementId = `yt-edit-player-${reactId.replace(/:/g, "")}`;
  const playerRef = useRef<EditorPlayer | null>(null);
  const pollRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [timedCalls, setTimedCalls] = useState<TimedCall[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [browserOrigin, setBrowserOrigin] = useState<string | null>(null);
  const [localEditEnabled, setLocalEditEnabled] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("オイ！");
  const [customPhrase, setCustomPhrase] = useState("");
  const [offset, setOffset] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [repeatBeats, setRepeatBeats] = useState(4);
  const [repeatCount, setRepeatCount] = useState(8);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const serverCanEdit = auth?.canEdit ?? false;
  const canEdit = serverCanEdit || localEditEnabled;
  const embedSrc =
    browserOrigin && videoId
      ? buildYouTubeEmbedSrc({
          videoId,
          origin: browserOrigin,
          startSeconds: liveVideo?.startSeconds,
          endSeconds: liveVideo?.endSeconds,
        })
      : null;

  const phraseGroups = useMemo(() => {
    const unique = (phrases: string[]) => Array.from(new Set(phrases));
    const configuredSongPhrases = songTemplateGroups(songTitle).flatMap((group) =>
      group.templates.map((template) => template.phrase)
    );
    const songPhrases = unique(
      configuredSongPhrases.length > 0
        ? configuredSongPhrases
        : [defaultSongPhrase(songTitle), "オイ！×4", "フゥ！"]
    );

    return [
      { label: "曲別", phrases: songPhrases },
      {
        label: "汎用",
        phrases: unique(GENERAL_TEMPLATES.map((template) => template.phrase)),
      },
      {
        label: "メンバー名",
        phrases: unique(MEMBER_TEMPLATES.map((template) => template.phrase)),
      },
    ];
  }, [songTitle]);

  const sortedCalls = useMemo(
    () => timedCalls.slice().sort((a, b) => a.time - b.time),
    [timedCalls]
  );

  const selectedCall = useMemo(
    () => sortedCalls.find((call) => call.id === selectedId) ?? null,
    [selectedId, sortedCalls]
  );

  const activeCall = useMemo(
    () =>
      sortedCalls.find(
        (call) => currentTime >= call.time && currentTime < call.time + 1.4
      ),
    [currentTime, sortedCalls]
  );

  const timelineEnd = Math.max(
    duration,
    currentTime + 10,
    ...sortedCalls.map((call) => call.time + 10),
    180
  );

  useEffect(() => {
    setBrowserOrigin(window.location.origin);
    setLocalEditEnabled(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response): Promise<AuthState | null> =>
        response.ok ? ((await response.json()) as AuthState) : null
      )
      .then((data) => {
        if (!cancelled) setAuth(data);
      })
      .catch(() => {
        if (!cancelled) setAuth({ user: null, role: null, canEdit: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    const fallback = loadTimedCalls(songTitle, videoId, defaultCalls);
    setTimedCalls(fallback);
    setSelectedId(fallback[0]?.id ?? null);

    fetch(
      `/api/calls?songTitle=${encodeURIComponent(songTitle)}&videoId=${encodeURIComponent(
        videoId
      )}`
    )
      .then(async (response): Promise<{ calls?: TimedCall[] } | null> =>
        response.ok ? ((await response.json()) as { calls?: TimedCall[] }) : null
      )
      .then((data) => {
        if (cancelled || !data?.calls || data.calls.length === 0) return;
        setTimedCalls(data.calls);
        setSelectedId(data.calls[0]?.id ?? null);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [defaultCalls, songTitle, videoId]);

  useEffect(() => {
    if (!embedSrc) return;
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !window.YT || playerRef.current) return;
      if (!document.getElementById(playerElementId)) return;
      playerRef.current = new window.YT.Player(playerElementId, {
        events: {
          onReady: () => {
            setIsReady(true);
          },
        },
      }) as EditorPlayer;
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
    };
  }, [embedSrc, playerElementId]);

  useEffect(() => {
    if (!isReady || pollRef.current) return;
    pollRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      const nextDuration = player.getDuration?.() ?? 0;
      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration);
      }
    }, 100);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [isReady]);

  const saveToServer = (calls: TimedCall[]) => {
    if (!videoId) return;
    if (!serverCanEdit) {
      setSaveState("saved");
      return;
    }
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    setSaveState("dirty");
    saveTimerRef.current = window.setTimeout(() => {
      setSaveState("saving");
      void fetch("/api/calls", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ songTitle, videoId, calls }),
      })
        .then((response) => {
          setSaveState(response.ok ? "saved" : "error");
        })
        .catch(() => setSaveState("error"));
    }, 500);
  };

  const updateTimedCalls = (next: TimedCall[]) => {
    if (!canEdit || !videoId) return;
    const sorted = next.slice().sort((a, b) => a.time - b.time);
    setTimedCalls(sorted);
    saveTimedCalls(songTitle, videoId, sorted);
    saveToServer(sorted);
  };

  const seekTo = (seconds: number) => {
    playerRef.current?.seekTo(Math.max(0, seconds), true);
    setCurrentTime(Math.max(0, seconds));
  };

  const addAt = (time: number, phrase = selectedPhrase, note = "高速打点") => {
    if (!canEdit || !phrase.trim()) return;
    const call: TimedCall = {
      id: makeId(),
      time: clampTime(time),
      phrase: phrase.trim(),
      note,
    };
    updateTimedCalls([...timedCalls, call]);
    setSelectedId(call.id);
  };

  const addNow = () => {
    addAt(currentTime + offset, selectedPhrase);
  };

  const addCustomNow = () => {
    const clean = customPhrase.trim();
    if (!clean) return;
    setSelectedPhrase(clean);
    addAt(currentTime + offset, clean);
    setCustomPhrase("");
  };

  const nudgeCall = (id: string, delta: number) => {
    updateTimedCalls(
      timedCalls.map((call) =>
        call.id === id
          ? { ...call, time: clampTime(call.time + delta) }
          : call
      )
    );
  };

  const nudgeSelected = (delta: number) => {
    if (!selectedCall) return;
    nudgeCall(selectedCall.id, delta);
  };

  const removeCall = (id: string) => {
    const next = timedCalls.filter((call) => call.id !== id);
    updateTimedCalls(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const removeSelected = () => {
    if (!selectedCall) return;
    removeCall(selectedCall.id);
  };

  const setCallPhrase = (id: string, value: string) => {
    updateTimedCalls(
      timedCalls.map((call) =>
        call.id === id ? { ...call, phrase: value.trim() || call.phrase } : call
      )
    );
  };

  const setCallTime = (id: string, value: string) => {
    const parsed = parseTimeInput(value);
    if (parsed === null) return;
    updateTimedCalls(
      timedCalls.map((call) =>
        call.id === id ? { ...call, time: clampTime(parsed) } : call
      )
    );
  };

  const addRepeat = () => {
    if (!canEdit || !selectedPhrase.trim()) return;
    const interval = (60 / bpm) * repeatBeats;
    const start = currentTime + offset;
    const generated = Array.from({ length: repeatCount }, (_, index) => ({
      id: makeId(),
      time: clampTime(start + interval * index),
      phrase: selectedPhrase,
      note: `${repeatBeats}拍ごとに自動生成`,
    }));
    updateTimedCalls([...timedCalls, ...generated]);
    setSelectedId(generated[0]?.id ?? selectedId);
  };

  const resetToDefaults = () => {
    updateTimedCalls(defaultCalls);
    setSelectedId(defaultCalls[0]?.id ?? null);
  };

  if (!liveVideo) {
    return (
      <div className="rounded-2xl border border-border bg-white p-5 text-sm text-ink-weak">
        この曲にはライブ映像がまだ設定されていません。
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
              CALL TIMING EDITOR
            </h2>
            <p className="mt-1 font-mono text-xs text-ink-weak">
              {formatSeconds(currentTime)} / {formatSeconds(timelineEnd)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {localEditEnabled && !serverCanEdit ? (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
                ローカル編集
              </span>
            ) : auth?.user ? (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-weak">
                @{auth.user.username} {canEdit ? "編集可" : "閲覧のみ"}
              </span>
            ) : (
              <a
                href="/api/auth/x/start"
                className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white transition hover:bg-ink/90"
              >
                Xでログイン
              </a>
            )}
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-weak">
              {saveState === "dirty"
                ? "変更あり"
                : saveState === "saving"
                  ? "保存中"
                  : saveState === "saved"
                    ? "保存済み"
                    : saveState === "error"
                      ? "保存失敗"
                      : "待機"}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-ink">
          {embedSrc ? (
            <iframe
              id={playerElementId}
              className="relative z-0 block aspect-video min-h-[220px] w-full sm:min-h-[420px]"
              src={embedSrc}
              title={`${songTitle} timing edit video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="aspect-video min-h-[220px] w-full sm:min-h-[420px]" />
          )}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/10 px-4 text-center">
            <p
              className={`max-w-[92%] break-words rounded-xl bg-black/50 px-4 py-3 text-4xl font-black leading-tight text-white shadow-[0_2px_18px_rgba(0,0,0,0.45)] ring-1 ring-white/20 transition ${
                activeCall ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              {activeCall?.phrase ?? "待機"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
            <div className="mb-3 space-y-2">
              {phraseGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-ink-weak">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.phrases.map((phrase) => (
                      <button
                        key={`${group.label}-${phrase}`}
                        type="button"
                        onClick={() => setSelectedPhrase(phrase)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                          selectedPhrase === phrase
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-white text-ink hover:border-accent"
                        }`}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={addNow}
                disabled={!canEdit}
                className="rounded-xl bg-accent px-4 py-4 text-2xl font-black text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
              >
                ここ！
              </button>
              <div className="grid grid-cols-3 gap-2 sm:w-56">
                <button
                  type="button"
                  onClick={() => nudgeSelected(-0.1)}
                  disabled={!canEdit || !selectedCall}
                  className="rounded-md border border-border bg-white px-2 py-2 text-xs text-ink-weak transition hover:border-accent hover:text-accent disabled:opacity-40"
                >
                  -0.1
                </button>
                <button
                  type="button"
                  onClick={() => nudgeSelected(0.1)}
                  disabled={!canEdit || !selectedCall}
                  className="rounded-md border border-border bg-white px-2 py-2 text-xs text-ink-weak transition hover:border-accent hover:text-accent disabled:opacity-40"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={removeSelected}
                  disabled={!canEdit || !selectedCall}
                  className="rounded-md border border-border bg-white px-2 py-2 text-xs text-ink-weak transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
                >
                  削除
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={customPhrase}
                onChange={(event) => setCustomPhrase(event.target.value)}
                disabled={!canEdit}
                placeholder="任意のコール"
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
              />
              <button
                type="button"
                onClick={addCustomNow}
                disabled={!canEdit || !customPhrase.trim()}
                className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
              >
                任意で打点
              </button>
              <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs text-ink-weak">
                補正
                <input
                  value={offset}
                  onChange={(event) => setOffset(Number(event.target.value))}
                  disabled={!canEdit}
                  type="number"
                  step="0.1"
                  className="w-16 bg-transparent font-mono text-ink outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="grid grid-cols-3 gap-2">
              <label className="text-[11px] font-semibold text-ink-weak">
                BPM
                <input
                  value={bpm}
                  onChange={(event) => setBpm(Number(event.target.value))}
                  disabled={!canEdit}
                  type="number"
                  min="60"
                  max="220"
                  className="mt-1 w-full rounded-md border border-border bg-white px-2 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-[11px] font-semibold text-ink-weak">
                拍
                <input
                  value={repeatBeats}
                  onChange={(event) => setRepeatBeats(Number(event.target.value))}
                  disabled={!canEdit}
                  type="number"
                  min="1"
                  max="32"
                  className="mt-1 w-full rounded-md border border-border bg-white px-2 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-[11px] font-semibold text-ink-weak">
                回数
                <input
                  value={repeatCount}
                  onChange={(event) => setRepeatCount(Number(event.target.value))}
                  disabled={!canEdit}
                  type="number"
                  min="1"
                  max="64"
                  className="mt-1 w-full rounded-md border border-border bg-white px-2 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={addRepeat}
                disabled={!canEdit}
                className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
              >
                繰り返し生成
              </button>
              <button
                type="button"
                onClick={resetToDefaults}
                disabled={!canEdit}
                className="rounded-md border border-border bg-white px-3 py-2 text-xs text-ink-weak transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
              >
                初期値に戻す
              </button>
            </div>
            {selectedCall && (
              <p className="mt-2 break-words rounded-md bg-white px-3 py-2 text-xs text-ink-weak">
                選択中: {formatSeconds(selectedCall.time)} {selectedCall.phrase}
              </p>
            )}
          </div>
        </div>

        {!canEdit && (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-xs text-ink-weak">
            コールタイミングの編集は許可されたXアカウントのみ可能です。
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="relative h-24 overflow-hidden rounded-xl border border-border bg-surface">
          <div
            className="absolute inset-y-0 w-px bg-accent"
            style={{ left: `${Math.min(100, (currentTime / timelineEnd) * 100)}%` }}
          />
          {sortedCalls.map((call) => {
            const left = Math.min(100, (call.time / timelineEnd) * 100);
            const selected = call.id === selectedId;
            return (
              <button
                key={`${call.id}-${call.time}-${call.phrase}`}
                type="button"
                onClick={() => {
                  setSelectedId(call.id);
                  seekTo(call.time);
                }}
                className={`absolute top-3 h-14 min-w-10 -translate-x-1/2 rounded-md border px-2 text-[10px] font-semibold shadow-sm transition ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-ink hover:border-accent"
                }`}
                style={{ left: `${left}%` }}
                title={`${formatSeconds(call.time)} ${call.phrase}`}
              >
                <span className="block font-mono">{formatSeconds(call.time)}</span>
                <span className="block max-w-20 truncate">{call.phrase}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-weak">
          <span>0:00.0</span>
          <span>{formatSeconds(timelineEnd)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
          TIMELINE
        </h2>
        <ol className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
          {sortedCalls.map((call) => {
            const selected = call.id === selectedId;
            return (
              <li
                key={call.id}
                className={`grid gap-2 rounded-lg border px-2 py-2 sm:grid-cols-[72px_96px_1fr_auto] ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(call.id);
                    seekTo(call.time);
                  }}
                  className="rounded bg-white px-2 py-1 font-mono text-xs text-accent transition hover:bg-accent hover:text-white"
                >
                  移動
                </button>
                <input
                  defaultValue={formatSeconds(call.time)}
                  onFocus={() => setSelectedId(call.id)}
                  onBlur={(event) => setCallTime(call.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  disabled={!canEdit}
                  className="rounded border border-border bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-accent"
                />
                <input
                  defaultValue={call.phrase}
                  onFocus={() => setSelectedId(call.id)}
                  onBlur={(event) => setCallPhrase(call.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  disabled={!canEdit}
                  className="min-w-0 rounded border border-border bg-white px-2 py-1 text-sm font-semibold text-ink outline-none focus:border-accent"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(call.id);
                      nudgeCall(call.id, -0.1);
                    }}
                    disabled={!canEdit}
                    className="rounded border border-border bg-white px-2 py-1 text-[10px] text-ink-weak transition hover:border-accent hover:text-accent disabled:opacity-40"
                  >
                    -0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(call.id);
                      nudgeCall(call.id, 0.1);
                    }}
                    disabled={!canEdit}
                    className="rounded border border-border bg-white px-2 py-1 text-[10px] text-ink-weak transition hover:border-accent hover:text-accent disabled:opacity-40"
                  >
                    +0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCall(call.id)}
                    disabled={!canEdit}
                    className="rounded border border-border bg-white px-2 py-1 text-[10px] text-ink-weak transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
