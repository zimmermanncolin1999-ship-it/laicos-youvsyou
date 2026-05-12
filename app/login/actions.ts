"use server";

import { redirect } from "next/navigation";
import { ensurePlayerUser, verifyLogin } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Benutzername und Passwort sind erforderlich." };
  }

  // First login bootstraps the configured player user.
  await ensurePlayerUser();

  const user = await verifyLogin(username, password);
  if (!user) {
    return { error: "Falscher Benutzername oder Passwort." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
