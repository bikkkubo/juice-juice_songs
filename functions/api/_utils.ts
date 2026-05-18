export type Env = {
  DB: D1Database;
  X_CLIENT_ID: string;
  X_CLIENT_SECRET: string;
  X_REDIRECT_URI: string;
  SESSION_SECRET: string;
  ADMIN_X_USER_IDS?: string;
};

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  exp: number;
};

const textEncoder = new TextEncoder();

export const json = (data: unknown, init: ResponseInit = {}) =>
  Response.json(data, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });

export const randomToken = (bytes = 32) => {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64Url(data);
};

export const base64Url = (bytes: ArrayBuffer | Uint8Array) => {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const sha256Base64Url = async (value: string) =>
  base64Url(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));

const hmacKey = (secret: string) =>
  crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

export const signSession = async (user: Omit<SessionUser, "exp">, env: Env) => {
  const payload: SessionUser = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
  const encodedPayload = base64Url(textEncoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(env.SESSION_SECRET);
  const signature = base64Url(
    await crypto.subtle.sign("HMAC", key, textEncoder.encode(encodedPayload))
  );
  return `${encodedPayload}.${signature}`;
};

export const readSession = async (
  request: Request,
  env: Env
): Promise<SessionUser | null> => {
  const token = getCookie(request, "hp_session");
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const key = await hmacKey(env.SESSION_SECRET);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signature),
    textEncoder.encode(payload)
  );
  if (!valid) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!parsed.id || !parsed.username || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
};

export const isAdmin = (user: SessionUser | null, env: Env) => {
  if (!user) return false;
  const ids = (env.ADMIN_X_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids.includes(user.id);
};

export const getRole = async (user: SessionUser | null, env: Env) => {
  if (!user) return null;
  if (isAdmin(user, env)) return "admin";

  const row = await env.DB.prepare(
    "select role from allowed_users where x_user_id = ? or lower(username) = lower(?)"
  )
    .bind(user.id, user.username)
    .first<{ role: string }>()
    .catch(() => null);
  if (!row?.role) return null;

  await env.DB.prepare(
    "update allowed_users set x_user_id = ? where lower(username) = lower(?) and x_user_id is null"
  )
    .bind(user.id, user.username)
    .run();

  return row.role;
};

export const getCookie = (request: Request, name: string) => {
  const header = request.headers.get("cookie") ?? "";
  const cookies = header.split(";").map((cookie) => cookie.trim());
  const prefix = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
};

export const setCookie = (
  name: string,
  value: string,
  options = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000"
) => `${name}=${encodeURIComponent(value)}; ${options}`;

export const clearCookie = (name: string) =>
  `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
