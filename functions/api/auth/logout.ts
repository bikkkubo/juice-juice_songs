import { clearCookie, json } from "../_utils";

export const onRequestPost: PagesFunction = async () => {
  return json(
    { ok: true },
    {
      headers: {
        "set-cookie": clearCookie("hp_session"),
      },
    }
  );
};
