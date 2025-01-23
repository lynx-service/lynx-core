import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { getSession } from "../utils/session.server";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return { session };
};

export default function Home({
  session,
}: any
) {
  return <Welcome />;
}
