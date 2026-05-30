import { type Env, getRole, json, readSession } from "./_utils";

const clean = (value: unknown, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

const requireAdmin = async (request: Request, env: Env) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  return role === "admin" ? user : null;
};

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as {
    groupSlug?: string;
    groupName?: string;
    url?: string;
    performanceName?: string;
    startPosition?: string;
    note?: string;
  } | null;

  const groupSlug = clean(body?.groupSlug, 80) || "unknown";
  const groupName = clean(body?.groupName, 120);
  const url = clean(body?.url, 800);
  const performanceName = clean(body?.performanceName, 240);
  const startPosition = clean(body?.startPosition, 80);
  const note = clean(body?.note, 1000);

  if (!url || !isValidHttpUrl(url)) {
    return json({ error: "valid_url_required" }, { status: 400 });
  }
  if (!performanceName) {
    return json({ error: "performance_name_required" }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  await env.DB.prepare(
    `insert into live_video_submissions
     (id, group_slug, group_name, url, performance_name, start_position, note)
     values (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, groupSlug, groupName, url, performanceName, startPosition, note)
    .run();

  return json({ ok: true, id });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await requireAdmin(request, env);
  if (!user) return json({ error: "forbidden" }, { status: 403 });

  const rows = await env.DB.prepare(
    `select id, group_slug, group_name, url, performance_name, start_position, note, status, created_at, reviewed_by, reviewed_at
     from live_video_submissions
     order by
       case when status = 'pending' then 0 else 1 end asc,
       created_at desc
     limit 300`
  )
    .all()
    .catch(() => ({ results: [] }));

  return json({
    submissions: (rows.results ?? []).map((row) => ({
      id: String(row.id ?? ""),
      groupSlug: String(row.group_slug ?? ""),
      groupName: String(row.group_name ?? ""),
      url: String(row.url ?? ""),
      performanceName: String(row.performance_name ?? ""),
      startPosition: String(row.start_position ?? ""),
      note: String(row.note ?? ""),
      status: String(row.status ?? "pending"),
      createdAt: String(row.created_at ?? ""),
      reviewedBy: String(row.reviewed_by ?? ""),
      reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    })),
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const user = await requireAdmin(request, env);
  if (!user) return json({ error: "forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: string;
  } | null;

  const id = clean(body?.id, 120);
  const status = clean(body?.status, 40) === "reviewed" ? "reviewed" : "pending";
  if (!id) return json({ error: "id_required" }, { status: 400 });

  await env.DB.prepare(
    `update live_video_submissions
     set status = ?,
         reviewed_by = case when ? = 'reviewed' then ? else '' end,
         reviewed_at = case when ? = 'reviewed' then current_timestamp else null end
     where id = ?`
  )
    .bind(status, status, user.id, status, id)
    .run();

  return json({ ok: true });
};
