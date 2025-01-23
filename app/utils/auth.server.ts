import { redirect } from "react-router";
import { getSession } from "./session.server";

export async function requireAuth(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  const accessToken = session.get("token");
  if (!accessToken) {
    // アクセストークンが存在しない場合、ログインページにリダイレクト
    throw redirect("/login");
  }

  return;
}
