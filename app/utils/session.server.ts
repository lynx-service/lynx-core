import { createCookieSessionStorage } from "react-router";

const sessionSecret = "testtest";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const getSession = sessionStorage.getSession;
export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;
