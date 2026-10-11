"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { submitContact, type FormState } from "@/app/actions/public";
import { BotProtection, Consent, FormMessage, SubmitButton, TextArea, TextField } from "./fields";
import { SuccessPanel } from "./success-panel";
import { useFormKey } from "./use-form-key";

export function ContactForm() {
  const [state, action] = useActionState<FormState, FormData>(submitContact, { ok: false });
  const key = useFormKey(state);
  if (state.ok) {
    return (
      <SuccessPanel title="Thank you — we have received your message" reference={state.reference}>
        <p>Our team will reply to the email address you provided. A confirmation email is sent when email delivery is configured.</p>
      </SuccessPanel>
    );
  }
  const v = state.values || {};
  const e = state.errors || {};
  return (
    <form key={key} action={action} noValidate className="relative space-y-5">
      <FormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" label="Full name" required autoComplete="name" defaultValue={v.fullName} error={e.fullName} />
        <TextField name="companyName" label="Company name" autoComplete="organization" defaultValue={v.companyName} error={e.companyName} />
        <TextField name="email" type="email" label="Email" required autoComplete="email" defaultValue={v.email} error={e.email} />
        <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone} error={e.phone} />
      </div>
      <TextField name="subject" label="Subject" required defaultValue={v.subject} error={e.subject} maxLength={160} />
      <TextArea name="message" label="Message" required rows={6} defaultValue={v.message} error={e.message} />
      <BotProtection />
      <Consent error={e.consent} defaultChecked={v.consent === "on"}>
        I agree to NTSO processing these details to respond to my message (see our{" "}
        <Link href="/privacy-policy" className="font-medium text-electric-700 underline">privacy policy</Link>).
      </Consent>
      <SubmitButton pendingText="Sending…">
        Send message <Send className="h-4 w-4" aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
