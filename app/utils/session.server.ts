import { createCookieSessionStorage } from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in environment variables");
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
