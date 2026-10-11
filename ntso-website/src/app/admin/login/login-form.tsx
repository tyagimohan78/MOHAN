"use client";

import { useActionState, useState } from "react";
import { loginAction, type AdminFormState } from "../actions";
import { SubmitButton, FormMessage } from "@/components/forms/fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AdminFormState, FormData>(loginAction, {});
  // Controlled so the email survives React's automatic form reset after a failed attempt.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="space-y-4">
      <FormMessage message={state.message} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <input type="hidden" name="next" value={next || ""} />
      <SubmitButton pendingText="Signing in…" className="w-full">Sign in</SubmitButton>
    </form>
  );
}
