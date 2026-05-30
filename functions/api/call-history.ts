import { type Env, getRole, json, readSession } from "./_utils";

type HistoryNotePayload = {
  id?: string;
  eventDate?: string;
  body?: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

const clean = (value: string | null | undefined, max: number) =>
  (value ?? "").trim().slice(0, max);

const cleanScope = (request: Request) => {
  const url = new URL(request.url);
  return {
    groupSlug: clean(url.searchParams.get("groupSlug"), 80) || "juice-juice",
    songTitle: clean(url.searchParams.get("songTitle"), 200),
    videoId: clean(url.searchParams.get("videoId"), 80),
    callVersion: clean(url.searchParams.get("callVersion"), 40) || "beginner",
  };
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { groupSlug, songTitle, videoId, callVersion } = cleanScope(request);

  if (!songTitle || !videoId) {
    return json({ error: "songTitle_and_videoId_required" }, { status: 400 });
  }

  const rows = await env.DB.prepare(
    `select id, event_date, body, source_label, source_url, updated_at
     from call_history_notes
     where group_slug = ? and song_title = ? and video_id = ? and call_version = ?
     order by
       case when event_date = '' then 1 else 0 end asc,
       event_date desc,
       updated_at desc`
  )
    .bind(groupSlug, songTitle, videoId, callVersion)
    .all()
    .catch(() => ({ results: [] }));

  return json({
    notes: (rows.results ?? []).map((row) => ({
      id: String(row.id ?? ""),
      eventDate: String(row.event_date ?? ""),
      body: String(row.body ?? ""),
      sourceLabel: String(row.source_label ?? ""),
      sourceUrl: String(row.source_url ?? ""),
      updatedAt: String(row.updated_at ?? ""),
    })),
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);
  if (!user || (role !== "admin" && role !== "editor")) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    groupSlug?: string;
    songTitle?: string;
    videoId?: string;
    callVersion?: string;
    notes?: HistoryNotePayload[];
  } | null;

  const groupSlug = clean(body?.groupSlug, 80) || "juice-juice";
  const songTitle = clean(body?.songTitle, 200);
  const videoId = clean(body?.videoId, 80);
  const callVersion = clean(body?.callVersion, 40) || "beginner";
  const notes = Array.isArray(body?.notes) ? body.notes : null;

  if (!songTitle || !videoId || !notes) {
    return json({ error: "invalid_payload" }, { status: 400 });
  }

  const normalized = notes
    .map((note) => ({
      id:
        clean(note.id, 120) ||
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`),
      eventDate: clean(note.eventDate, 40),
      body: clean(note.body, 1000),
      sourceLabel: clean(note.sourceLabel, 160),
      sourceUrl: clean(note.sourceUrl, 500),
    }))
    .filter((note) => note.body)
    .slice(0, 100);

  await env.DB.prepare(
    `delete from call_history_notes
     where group_slug = ? and song_title = ? and video_id = ? and call_version = ?`
  )
    .bind(groupSlug, songTitle, videoId, callVersion)
    .run();

  for (const note of normalized) {
    await env.DB.prepare(
      `insert into call_history_notes
       (id, group_slug, song_title, video_id, call_version, event_date, body,
        source_label, source_url, created_by, updated_by, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
      .bind(
        note.id,
        groupSlug,
        songTitle,
        videoId,
        callVersion,
        note.eventDate,
        note.body,
        note.sourceLabel,
        note.sourceUrl,
        user.id,
        user.id
      )
      .run();
  }

  return json({ ok: true, count: normalized.length });
};
