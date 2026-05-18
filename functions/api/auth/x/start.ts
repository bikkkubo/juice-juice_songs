import {
  type Env,
  randomToken,
  setCookie,
  sha256Base64Url,
} from "../../_utils";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const state = randomToken(24);
  const verifier = randomToken(48);
  const challenge = await sha256Base64Url(verifier);

  const authorizeUrl = new URL("https://x.com/i/oauth2/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", env.X_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", env.X_REDIRECT_URI);
  authorizeUrl.searchParams.set("scope", "tweet.read users.read offline.access");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const headers = new Headers({ location: authorizeUrl.toString() });
  headers.append(
    "set-cookie",
    setCookie("x_oauth_state", state, "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600")
  );
  headers.append(
    "set-cookie",
    setCookie(
      "x_oauth_verifier",
      verifier,
      "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600"
    )
  );

  return new Response(null, { status: 302, headers });
};
