import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");

  const res = await fetch("http://localhost:3000/hello", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    throw new Response("Failed to fetch data", { status: res.status });
  }

  const data: string = await res.text();
  return { data, user };
};

export default function Home() {
  const { data, user } = useLoaderData();
  return (
    <>
      <div className="text-gray-600 dark:text-gray-300">
        <div>
          {data}
        </div>
        <div>
          {user && (
            <div>
              <h1>ID：{user.id}</h1>
              <p>メールアドレス：{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}