import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  username?: string;
};

const sessionPassword = process.env.SESSION_PASSWORD;
if (!sessionPassword || sessionPassword.length < 32) {
  // Helpful dev guard — iron-session requires ≥32 char secret.
  throw new Error(
    "SESSION_PASSWORD env var missing or too short (must be ≥32 chars)."
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "yvy_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
