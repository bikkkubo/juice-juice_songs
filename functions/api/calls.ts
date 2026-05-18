import { type Env, getRole, json, readSession } from "./_utils";

type CallPayload = {
  id?: string;
  time: number;
  phrase: string;
  note?: string;
};

const cleanSong = (value: string | null) => (value ?? "").trim().slice(0, 200);
const cleanVideo = (value: string | null) => (value ?? "").trim().slice(0, 80);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const songTitle = cleanSong(url.searchParams.get("songTitle"));
  const videoId = cleanVideo(url.searchParams.get("videoId"));

  if (!songTitle || !videoId) {
    return json({ error: "songTitle_and_videoId_required" }, { status: 400 });
  }

  const rows = await env.DB.prepare(
    `select id, time, phrase, note
     from call_events
     where song_title = ? and video_id = ?
     order by time asc`
  )
    .bind(songTitle, videoId)
    .all()
    .catch(() => ({ results: [] }));

  return json({ calls: rows.results ?? [] });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  if (!user || (role !== "admin" && role !== "editor")) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    songTitle?: string;
    videoId?: string;
    calls?: CallPayload[];
  } | null;

  const songTitle = cleanSong(body?.songTitle ?? null);
  const videoId = cleanVideo(body?.videoId ?? null);
  const calls = Array.isArray(body?.calls) ? body.calls : null;

  if (!songTitle || !videoId || !calls) {
    return json({ error: "invalid_payload" }, { status: 400 });
  }

  const normalized = calls
    .map((call) => ({
      id:
        typeof call.id === "string" && call.id.trim()
          ? call.id.trim().slice(0, 120)
          : crypto.randomUUID(),
      time: Number(call.time),
      phrase: String(call.phrase ?? "").trim().slice(0, 120),
      note: String(call.note ?? "").trim().slice(0, 500),
    }))
    .filter((call) => Number.isFinite(call.time) && call.time >= 0 && call.phrase)
    .slice(0, 500);

  await env.DB.prepare(
    "delete from call_events where song_title = ? and video_id = ?"
  )
    .bind(songTitle, videoId)
    .run();

  for (const call of normalized) {
    await env.DB.prepare(
      `insert into call_events
       (id, song_title, video_id, time, phrase, note, created_by, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
      .bind(
        call.id,
        songTitle,
        videoId,
        Number(call.time.toFixed(1)),
        call.phrase,
        call.note,
        user.id
      )
      .run();
  }

  return json({ ok: true, count: normalized.length });
};
