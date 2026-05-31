import { type Env, json } from "./_utils";

const clean = (value: string | null, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const groupSlug = clean(url.searchParams.get("groupSlug"), 80);
  if (!groupSlug) return json({ submissions: [] });

  const rows = await env.DB.prepare(
    `select id, group_slug, group_name, url, performance_name, start_position, reviewed_at
     from live_video_submissions
     where status = 'reviewed' and group_slug = ?
     order by reviewed_at desc, created_at desc
     limit 20`
  )
    .bind(groupSlug)
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
      reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    })),
  });
};
