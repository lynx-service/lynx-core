import type { Route } from "./+types/success";
import { redirect } from "react-router";
import { getSession, commitSession } from "../../utils/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // リクエストURLからaccessTokenを取得
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // accessTokenがない場合はログイン画面にリダイレクト
  if (!token) {
    return redirect("/login");
  }

  // accessTokenを使ってユーザー情報を取得
  const res = await fetch("http://localhost:3000/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // ユーザー情報の取得に失敗した場合はログイン画面にリダイレクト
  if (!res.ok) {
    console.error(`Failed to fetch User Data: ${res.status} - ${res.statusText}`);
    return redirect("/login");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const user = await res.json();
  
  // セッションにトークンとユーザー情報を保存
  session.set("token", token);
  session.set("user", user);

  // ユーザー情報を取得できた場合はホーム画面にリダイレクト
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
