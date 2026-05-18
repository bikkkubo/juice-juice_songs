import { type Env, getRole, json, readSession } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  if (role !== "admin") return json({ error: "forbidden" }, { status: 403 });

  const rows = await env.DB.prepare(
    `select
       a.id,
       a.x_user_id,
       a.username,
       a.role,
       a.created_at,
       l.name as name,
       l.last_login_at as last_login_at
     from allowed_users a
     left join x_user_logins l
       on l.x_user_id = a.x_user_id
       or (a.x_user_id is null and lower(l.username) = lower(a.username))
     order by a.created_at desc`
  ).all();

  const loginRows = await env.DB.prepare(
    `select
       l.x_user_id,
       l.username,
       l.name,
       l.first_seen_at,
       l.last_login_at,
       a.role as role
     from x_user_logins l
     left join allowed_users a
       on a.x_user_id = l.x_user_id
       or lower(a.username) = lower(l.username)
     order by l.last_login_at desc
     limit 100`
  ).all();

  return json({ users: rows.results ?? [], logins: loginRows.results ?? [] });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  if (role !== "admin") return json({ error: "forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    xUserId?: string;
    username?: string;
    role?: string;
  } | null;

  const xUserId = String(body?.xUserId ?? "").trim() || null;
  const username = String(body?.username ?? "").trim().replace(/^@/, "");
  const nextRole = body?.role === "admin" ? "admin" : "editor";

  if (!username) {
    return json({ error: "username_required" }, { status: 400 });
  }

  if (xUserId) {
    await env.DB.prepare(
      "delete from allowed_users where x_user_id = ? and lower(username) != lower(?)"
    )
      .bind(xUserId, username)
      .run();
  }

  await env.DB.prepare(
    xUserId
      ? `insert into allowed_users (x_user_id, username, role)
         values (?, ?, ?)
         on conflict(username) do update set
           x_user_id = excluded.x_user_id,
           role = excluded.role`
      : `insert into allowed_users (x_user_id, username, role)
         values (?, ?, ?)
         on conflict(username) do update set
           role = excluded.role`
  )
    .bind(xUserId, username, nextRole)
    .run();

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  if (role !== "admin") return json({ error: "forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const username = url.searchParams.get("username")?.replace(/^@/, "");
  if (!username) return json({ error: "username_required" }, { status: 400 });

  await env.DB.prepare("delete from allowed_users where lower(username) = lower(?)")
    .bind(username)
    .run();

  return json({ ok: true });
};
