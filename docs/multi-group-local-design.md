# Multi-group local design

This branch keeps the current Juice=Juice data intact while introducing a
group-first URL and data structure.

## URL structure

- `/` is the group selector.
- `/[group]/` is the group home.
- `/[group]/songs/[title]/` is the song page.
- `/[group]/songs/[title]/calls/edit/` is the call editor.
- `/[group]/members/[name]/` is the member page.
- `/[group]/setlists/` is the setlist page.
- `/[group]/learn/` is the beginner call page.

The existing non-group routes still exist for compatibility, but new links from
the multi-group pages use the group-first paths.

## Data structure

Group metadata lives in `data/groups/index.json`.

Each group gets its own data directory:

```txt
data/groups/[group]/releases.json
data/groups/[group]/members.json
data/groups/[group]/aliases.json
data/groups/[group]/credits.json
```

`juice-juice` contains the existing production data. The other groups currently
are populated from the official Hello! Project release JSON and release detail
pages by `scripts/import-official-releases.mjs`.

The import script currently writes release and credit data for:

- `angerme`
- `morning-musume`
- `ocha-norma`
- `tsubaki-factory`
- `rosy-chronicle`

Member timeline data is still intentionally empty for these groups. Releases
therefore have empty `lineup` arrays until member histories are imported.

## Runtime notes

- Song indexes are built per group in `app/songs.ts`.
- Search links use each group's `artistKeyword`.
- Local call memo and timed-call storage keys include `groupSlug` to avoid
  collisions between groups.
- The current call API and D1 schema still identify songs by title only. Before
  enabling multi-group call publishing in production, add `group_slug` to the
  calls-related tables and API payloads.

## Future: call difficulty versions

The current timed-call data should be treated as the beginner version.

Longer term, each song/video should support multiple editable call versions:

- Beginner: the current default. Keep this focused on orthodox, easy-to-follow
  calls for people who are new to the live.
- Advanced: a copied version derived from Beginner, then editable separately.
  This can include extra calls such as `ウー` and denser audience responses.

Expected workflow:

1. A song starts with only the Beginner version.
2. Editors can create Advanced by copying Beginner for the same
   `groupSlug + songTitle + videoId`.
3. Beginner and Advanced are edited independently after the copy.
4. The song page and call editor expose a simple version switcher.
5. Public playback defaults to Beginner unless the user switches versions.

Data/API notes for later implementation:

- Add a version key such as `difficulty` or `call_version`.
- Suggested values: `beginner` and `advanced`.
- D1 `call_events` should include the version key in the lookup/delete scope:
  `group_slug + song_title + video_id + call_version`.
- LocalStorage keys should include the version key as well.
- Existing records without a version should migrate or resolve as `beginner`.

## Future: lyric-card review and call history notes

Add a non-audio review mode to each existing call practice page. Do not add new
routes for this feature because Cloudflare Pages file-count limits are already a
real deployment constraint.

Expected lyric-card workflow:

1. Each song page keeps the current synced video/audio call practice.
2. The same page also includes a lyric-card section lower on the page.
3. A button near the call practice area scrolls to the lyric-card section.
4. The lyric-card view shows the entered calls alongside the lyrics/timing notes
   so users can review silently right before a live.
5. If full lyrics cannot be stored directly because of rights constraints, keep
   lyric text as editor-entered short anchors/section labels and link out to the
   existing official/lyrics search destination.

Expected call history note workflow:

1. Each song/video/call-version can have editorial notes about how or when a call
   was added or changed.
2. Notes are displayed near the lyric-card or call practice section, not as a
   separate page.
3. Example note type: `KEEP ON 上昇志向!!` final audience singing was added from
   the previous autumn tour's Sendai performance at the members' request.
4. Notes should be timestamped and editable by authorized editors.

Data/API notes for later implementation:

- Add a `call_history_notes` table or JSON-backed content keyed by
  `group_slug + song_title + video_id + call_version`.
- Suggested fields: `id`, `body`, `source_label`, `source_url`, `event_date`,
  `created_by`, `created_at`, `updated_at`.
- Lyric-card display can reuse timed calls from `call_events`; add optional
  section/lyric-anchor metadata only if needed.
- Keep the UI embedded in `/[group]/songs/[title]/` and
  `/[group]/songs/[title]/calls/edit/` instead of creating additional static
  pages.
