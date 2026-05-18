import { type Env, getRole, json, readSession } from "../_utils";

const cleanSong = (value: unknown) =>
  String(value ?? "")
    .trim()
    .slice(0, 200);

const requireAdmin = async (request: Request, env: Env) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  return role === "admin" ? user : null;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await requireAdmin(request, env);
  if (!user) return json({ error: "forbidden" }, { status: 403 });

  const rows = await env.DB.prepare(
    `select
       e.song_title as title,
       count(e.id) as call_count,
       max(e.updated_at) as last_updated_at,
       a.approved_at as approved_at,
       a.approved_by as approved_by
     from call_events e
     left join call_song_approvals a on a.song_title = e.song_title
     group by e.song_title
     order by
       case when a.approved_at is null then 0 else 1 end asc,
       max(e.updated_at) desc,
       e.song_title asc`
  )
    .all()
    .catch(() => ({ results: [] }));

  return json({
    songs: (rows.results ?? []).map((row) => ({
      title: String(row.title ?? ""),
      callCount: Number(row.call_count ?? 0),
      lastUpdatedAt: row.last_updated_at ?? null,
      approvedAt: row.approved_at ?? null,
      approvedBy: row.approved_by ?? null,
    })),
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const user = await requireAdmin(request, env);
  if (!user) return json({ error: "forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    songTitle?: string;
    approved?: boolean;
  } | null;

  const songTitle = cleanSong(body?.songTitle);
  if (!songTitle) return json({ error: "songTitle_required" }, { status: 400 });

  if (body?.approved) {
    await env.DB.prepare(
      `insert into call_song_approvals (song_title, approved_by, approved_at)
       values (?, ?, current_timestamp)
       on conflict(song_title) do update set
         approved_by = excluded.approved_by,
         approved_at = current_timestamp`
    )
      .bind(songTitle, user.id)
      .run();
  } else {
    await env.DB.prepare("delete from call_song_approvals where song_title = ?")
      .bind(songTitle)
      .run();
  }

  return json({ ok: true });
};
