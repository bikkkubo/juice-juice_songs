import { type Env, getRole, json, readSession } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await readSession(request, env);
  const role = await getRole(user, env);

  return json({
    user: user
      ? {
          id: user.id,
          username: user.username,
          name: user.name,
        }
      : null,
    role,
    canEdit: role === "admin" || role === "editor",
  });
};
