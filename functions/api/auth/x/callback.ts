import {
  type Env,
  clearCookie,
  getCookie,
  json,
  setCookie,
  signSession,
} from "../../_utils";

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type XUserResponse = {
  data?: {
    id: string;
    name: string;
    username: string;
  };
  errors?: unknown[];
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = getCookie(request, "x_oauth_state");
  const verifier = getCookie(request, "x_oauth_verifier");

  if (!code || !state || !savedState || !verifier || state !== savedState) {
    return json({ error: "invalid_oauth_state" }, { status: 400 });
  }

  const basic = btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.X_REDIRECT_URI,
    code_verifier: verifier,
  });

  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${basic}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const token = (await tokenResponse.json()) as TokenResponse;
  if (!tokenResponse.ok || !token.access_token) {
    return json(
      { error: token.error ?? "token_exchange_failed", detail: token.error_description },
      { status: 401 }
    );
  }

  const meResponse = await fetch("https://api.x.com/2/users/me", {
    headers: {
      authorization: `Bearer ${token.access_token}`,
    },
  });
  const me = (await meResponse.json()) as XUserResponse;
  if (!meResponse.ok || !me.data) {
    return json({ error: "user_fetch_failed", detail: me.errors }, { status: 401 });
  }

  await env.DB.prepare(
    `insert into x_user_logins (x_user_id, username, name, first_seen_at, last_login_at)
     values (?, ?, ?, current_timestamp, current_timestamp)
     on conflict(x_user_id) do update set
       username = excluded.username,
       name = excluded.name,
       last_login_at = current_timestamp`
  )
    .bind(me.data.id, me.data.username, me.data.name)
    .run()
    .catch(() => null);

  await env.DB.prepare(
    "update allowed_users set x_user_id = ? where lower(username) = lower(?) and x_user_id is null"
  )
    .bind(me.data.id, me.data.username)
    .run()
    .catch(() => null);

  const session = await signSession(
    {
      id: me.data.id,
      username: me.data.username,
      name: me.data.name,
    },
    env
  );

  const headers = new Headers({
    location: "/",
  });
  headers.append("set-cookie", setCookie("hp_session", session));
  headers.append("set-cookie", clearCookie("x_oauth_state"));
  headers.append("set-cookie", clearCookie("x_oauth_verifier"));

  return new Response(null, {
    status: 302,
    headers,
  });
};
