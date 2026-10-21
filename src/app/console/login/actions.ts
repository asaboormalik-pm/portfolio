"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string } | null;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/console",
    });
    return null;
  } catch (e) {
    // signIn signals success by throwing a redirect, so only swallow auth failures.
    if (e instanceof AuthError) return { error: "That email and password don't match." };
    throw e;
  }
}
