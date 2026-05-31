"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

type AdminUser = {
  id: number;
  x_user_id: string | null;
  username: string;
  name: string | null;
  role: string;
  created_at: string;
  last_login_at: string | null;
};

type LoginUser = {
  x_user_id: string;
  username: string;
  name: string;
  first_seen_at: string;
  last_login_at: string;
  role: string | null;
};

type MeResponse = {
  user: { username: string; name: string } | null;
  role: string | null;
  canEdit: boolean;
};

type CallApprovalSong = {
  title: string;
  callCount: number;
  lastUpdatedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
};

type LiveVideoSubmission = {
  id: string;
  groupSlug: string;
  groupName: string;
  url: string;
  performanceName: string;
  startPosition: string;
  note: string;
  status: string;
  createdAt: string;
  reviewedBy: string;
  reviewedAt: string | null;
};

export default function AdminPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logins, setLogins] = useState<LoginUser[]>([]);
  const [callSongs, setCallSongs] = useState<CallApprovalSong[]>([]);
  const [liveVideoSubmissions, setLiveVideoSubmissions] = useState<
    LiveVideoSubmission[]
  >([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("editor");
  const [message, setMessage] = useState("");

  const load = async () => {
    const meResponse = await fetch("/api/auth/me", { credentials: "include" });
    const meData = meResponse.ok ? ((await meResponse.json()) as MeResponse) : null;
    setMe(meData);

    if (meData?.role !== "admin") return;
    const usersResponse = await fetch("/api/admin/allowed-users", {
      credentials: "include",
    });
    if (usersResponse.ok) {
      const data = (await usersResponse.json()) as {
        users: AdminUser[];
        logins?: LoginUser[];
      };
      setUsers(data.users);
      setLogins(data.logins ?? []);
    }

    const callSongsResponse = await fetch("/api/admin/call-song-approvals", {
      credentials: "include",
    });
    if (callSongsResponse.ok) {
      const data = (await callSongsResponse.json()) as {
        songs: CallApprovalSong[];
      };
      setCallSongs(data.songs);
    }

    const liveVideoResponse = await fetch("/api/live-video-submissions", {
      credentials: "include",
    });
    if (liveVideoResponse.ok) {
      const data = (await liveVideoResponse.json()) as {
        submissions: LiveVideoSubmission[];
      };
      setLiveVideoSubmissions(data.submissions);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addUser = async () => {
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;

    const response = await fetch("/api/admin/allowed-users", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: clean, role }),
    });

    setMessage(response.ok ? `@${clean} を追加しました` : "追加できませんでした");
    setUsername("");
    await load();
  };

  const removeUser = async (target: string) => {
    const response = await fetch(
      `/api/admin/allowed-users?username=${encodeURIComponent(target)}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    setMessage(response.ok ? `@${target} を削除しました` : "削除できませんでした");
    await load();
  };

  const approveLoginUser = async (login: LoginUser, nextRole: string) => {
    const response = await fetch("/api/admin/allowed-users", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        xUserId: login.x_user_id,
        username: login.username,
        role: nextRole,
      }),
    });

    setMessage(
      response.ok
        ? `@${login.username} を ${nextRole} として承認しました`
        : "承認できませんでした"
    );
    await load();
  };

  const setCallApproval = async (songTitle: string, approved: boolean) => {
    const response = await fetch("/api/admin/call-song-approvals", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ songTitle, approved }),
    });

    setMessage(
      response.ok
        ? `${songTitle} を${approved ? "承認" : "非承認に"}しました`
        : "承認状態を更新できませんでした"
    );
    await load();
  };

  const setLiveVideoSubmissionStatus = async (id: string, status: string) => {
    const response = await fetch("/api/live-video-submissions", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    setMessage(
      response.ok ? "ライブ映像URL申請の状態を更新しました" : "状態を更新できませんでした"
    );
    await load();
  };

  return (
    <main className="mx-auto max-w-page px-5 pb-24 pt-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
      >
        ← トップに戻る
      </Link>

      <header className="mb-8">
        <p className="mb-2 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
          ADMIN
        </p>
        <h1 className="text-2xl font-bold text-ink">編集メンバー管理</h1>
        <Link
          href="/manual/call-editor/"
          className="mt-3 inline-flex rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          コール編集マニュアルを見る
        </Link>
      </header>

      {!me?.user ? (
        <a
          href="/api/auth/x/start"
          className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          Xでログイン
        </a>
      ) : me.role !== "admin" ? (
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink-weak">
          @{me.user.username} には管理権限がありません。
        </p>
      ) : (
        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-4">
            <h2 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-ink-weak">
              APPROVE LOGGED-IN USERS
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-ink-weak">
              Xログイン済みユーザーを選んで承認します。今後はこちらを使うとX IDが必ず紐づきます。
            </p>
            {logins.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-weak">
                まだXログインしたユーザーはいません
              </p>
            ) : (
              <ul className="space-y-2">
                {logins.map((login) => (
                  <li
                    key={login.x_user_id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-ink">
                        @{login.username}
                        {login.name ? (
                          <span className="ml-2 font-normal text-ink-weak">
                            {login.name}
                          </span>
                        ) : null}
                      </p>
                      <p className="font-mono text-[11px] text-ink-weak">
                        {login.role ? `承認済み: ${login.role}` : "未承認"} / last{" "}
                        {login.last_login_at}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => approveLoginUser(login, "editor")}
                        className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                      >
                        editor
                      </button>
                      <button
                        type="button"
                        onClick={() => approveLoginUser(login, "admin")}
                        className="rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ink/90"
                      >
                        admin
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {message && <p className="mt-3 text-xs text-ink-weak">{message}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <h2 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-ink-weak">
              ADD USER BY USERNAME
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-ink-weak">
              事前登録用です。本人がXログインすると自動でX IDが紐づきます。
            </p>
            <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="@username"
                className="rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
              />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
              >
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
              <button
                type="button"
                onClick={addUser}
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                追加
              </button>
            </div>
            {message && <p className="mt-3 text-xs text-ink-weak">{message}</p>}
          </div>

          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">@{user.username}</p>
                  <p className="font-mono text-[11px] text-ink-weak">
                    {user.role}
                    {user.x_user_id
                      ? ` / 紐づき済み / last ${user.last_login_at ?? "未確認"}`
                      : " / 未ログイン仮登録"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeUser(user.username)}
                  className="shrink-0 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-ink-weak transition hover:border-ink/30 hover:text-ink"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-ink-weak">
                  APPROVE CALL SONGS
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-weak">
                  ここで承認した曲だけがトップの「コールが登録されている曲」に表示されます。
                </p>
              </div>
              <span className="font-mono text-[11px] text-ink-weak">
                {callSongs.filter((song) => song.approvedAt).length} /{" "}
                {callSongs.length} approved
              </span>
            </div>

            {callSongs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-weak">
                サーバーに保存されたコールはまだありません
              </p>
            ) : (
              <ul className="space-y-2">
                {callSongs.map((song) => {
                  const approved = Boolean(song.approvedAt);
                  return (
                    <li
                      key={song.title}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-ink">
                          {song.title}
                        </p>
                        <p className="font-mono text-[11px] text-ink-weak">
                          {song.callCount} calls
                          {song.lastUpdatedAt
                            ? ` / updated ${song.lastUpdatedAt}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCallApproval(song.title, !approved)}
                        className={
                          approved
                            ? "shrink-0 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent/90"
                            : "shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                        }
                      >
                        {approved ? "承認済み" : "承認する"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-ink-weak">
                  LIVE VIDEO URL SUBMISSIONS
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-weak">
                  トップバーの「映像URL申請」から送信されたURLです。確認済みにすると、公演名が一致するセトリ内の曲が各グループページの「映像はあるがコールが登録されていない曲」に反映されます。
                </p>
              </div>
              <span className="font-mono text-[11px] text-ink-weak">
                {
                  liveVideoSubmissions.filter(
                    (submission) => submission.status === "pending"
                  ).length
                }{" "}
                pending
              </span>
            </div>

            {liveVideoSubmissions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-ink-weak">
                申請されたライブ映像URLはまだありません
              </p>
            ) : (
              <ul className="space-y-2">
                {liveVideoSubmissions.map((submission) => {
                  const reviewed = submission.status === "reviewed";
                  return (
                    <li
                      key={submission.id}
                      className="rounded-lg border border-border bg-surface/60 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">
                            {submission.groupName || submission.groupSlug}
                          </p>
                          <p className="mt-0.5 break-words text-sm font-semibold text-ink">
                            {submission.performanceName || "公演名未入力"}
                            {submission.startPosition ? (
                              <span className="ml-2 font-mono text-xs font-normal text-ink-weak">
                                {submission.startPosition}
                              </span>
                            ) : null}
                          </p>
                          <a
                            href={submission.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-sm text-accent underline-offset-2 hover:underline"
                          >
                            {submission.url}
                          </a>
                          {submission.note && (
                            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink-weak">
                              {submission.note}
                            </p>
                          )}
                          <p className="mt-1 font-mono text-[11px] text-ink-weak">
                            submitted {submission.createdAt}
                            {submission.reviewedAt
                              ? ` / reviewed ${submission.reviewedAt}`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setLiveVideoSubmissionStatus(
                              submission.id,
                              reviewed ? "pending" : "reviewed"
                            )
                          }
                          className={
                            reviewed
                              ? "shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                              : "shrink-0 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent/90"
                          }
                        >
                          {reviewed ? "確認済み" : "未確認"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
