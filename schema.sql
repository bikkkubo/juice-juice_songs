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
