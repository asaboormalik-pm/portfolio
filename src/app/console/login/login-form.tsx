"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "../ui";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} onSubmit={submitWithoutReset(action)}>
      <label className="field">
        <span>Email</span>
        <input type="email" name="email" required autoComplete="username" />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
        {state && (
          <p className="form-status form-status--err" role="alert">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
