import { redirect } from "react-router";
import type { Route } from "./+types/success";
import { getSession, commitSession } from "../../utils/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/"); // トークンがない場合はトップページにリダイレクト
  }

  // セッションにトークンを保存
  const session = await getSession(request.headers.get("Cookie"));
  session.set("token", token);

  console.log("session", session);

  console.log(session.get("token"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
