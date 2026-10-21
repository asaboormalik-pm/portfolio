import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="login">
      <section className="panel">
        <p className="eyebrow">Owner console</p>
        <h2>Sign in</h2>
        <LoginForm />
      </section>
    </main>
  );
}
