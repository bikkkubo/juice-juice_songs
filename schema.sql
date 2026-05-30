create table if not exists allowed_users (
  id integer primary key autoincrement,
  x_user_id text unique,
  username text not null unique collate nocase,
  role text not null default 'editor',
  created_at text not null default current_timestamp
);

create table if not exists x_user_logins (
  x_user_id text primary key,
  username text not null collate nocase,
  name text not null default '',
  first_seen_at text not null default current_timestamp,
  last_login_at text not null default current_timestamp
);

create index if not exists x_user_logins_username_idx
  on x_user_logins (username);

create table if not exists call_events (
  id text primary key,
  song_title text not null,
  video_id text not null,
  time real not null,
  phrase text not null,
  note text not null default '',
  created_by text not null,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists call_events_song_video_idx
  on call_events (song_title, video_id, time);

create table if not exists call_song_approvals (
  song_title text primary key,
  approved_by text not null,
  approved_at text not null default current_timestamp
);

create table if not exists call_history_notes (
  id text primary key,
  group_slug text not null default 'juice-juice',
  song_title text not null,
  video_id text not null,
  call_version text not null default 'beginner',
  event_date text not null default '',
  body text not null,
  source_label text not null default '',
  source_url text not null default '',
  created_by text not null,
  created_at text not null default current_timestamp,
  updated_by text not null,
  updated_at text not null default current_timestamp
);

create index if not exists call_history_notes_scope_idx
  on call_history_notes (group_slug, song_title, video_id, call_version, event_date);

create table if not exists live_video_submissions (
  id text primary key,
  group_slug text not null,
  group_name text not null default '',
  url text not null,
  performance_name text not null default '',
  start_position text not null default '',
  note text not null default '',
  status text not null default 'pending',
  created_at text not null default current_timestamp,
  reviewed_by text not null default '',
  reviewed_at text
);

create index if not exists live_video_submissions_status_idx
  on live_video_submissions (status, created_at);

create index if not exists live_video_submissions_group_idx
  on live_video_submissions (group_slug, created_at);
