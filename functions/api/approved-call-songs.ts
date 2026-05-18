import { type Env, json } from "./_utils";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare(
    `select
       a.song_title as title,
       count(e.id) as call_count,
       min(e.video_id) as video_id
     from call_song_approvals a
     join call_events e on e.song_title = a.song_title
     group by a.song_title
     order by a.approved_at desc`
  )
    .all()
    .catch(() => ({ results: [] }));

  return json({
    songs: (rows.results ?? []).map((row) => ({
      title: String(row.title ?? ""),
      callCount: Number(row.call_count ?? 0),
      videoId: row.video_id ? String(row.video_id) : null,
    })),
  });
};
