"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LiveVideoSubmissionButton from "@/components/LiveVideoSubmissionButton";
import PracticeNotice from "@/components/PracticeNotice";

type Props = {
  songCount: number;
  memberCount: number;
  groupName?: string;
  groupHref?: string;
  groupSlug?: string;
};

type AuthState = {
  user: { username: string; name: string } | null;
  role: string | null;
  canEdit: boolean;
};

export default function Header({
  songCount,
  memberCount,
  groupName = "Juice=Juice",
  groupHref = "/juice-juice/",
  groupSlug = "juice-juice",
}: Props) {
  const [auth, setAuth] = useState<AuthState | null>(null);

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
        if (!cancelled) {
          setAuth({ user: null, role: null, canEdit: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link
            href={groupHref}
            className="text-base font-bold text-ink transition hover:text-accent"
          >
            {groupName}コール練習サイト
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] font-mono text-ink-weak">
            <div className="hidden items-center gap-1.5 sm:flex">
              <Chip label={`${songCount} songs`} />
              <Chip label={`${memberCount} members`} />
              <Chip label="call practice" />
            </div>

            <LiveVideoSubmissionButton
              groupSlug={groupSlug}
              groupName={groupName}
            />

            {auth?.user ? (
              <>
                <span className="rounded-full border border-border bg-white px-2 py-0.5">
                  @{auth.user.username}
                  {auth.canEdit ? " / 編集可" : ""}
                </span>
                {auth.role === "admin" && (
                  <Link
                    href="/admin/"
                    className="rounded-full border border-accent bg-accent px-2.5 py-1 font-semibold text-white transition hover:bg-accent/90"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-border bg-white px-2.5 py-1 font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <a
                href="/api/auth/x/start"
                className="rounded-full border border-ink bg-ink px-2.5 py-1 font-semibold text-white transition hover:bg-ink/90"
              >
                Xログイン
              </a>
            )}
          </div>
        </div>
      </header>
      <PracticeNotice />
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2 py-0.5">
      {label}
    </span>
  );
}
