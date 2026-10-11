"use client";

import { useActionState } from "react";
import { Search } from "lucide-react";
import { lookupTicket, type FormState } from "@/app/actions/public";
import { FormMessage, SubmitButton, TextField } from "./fields";
import { useFormKey } from "./use-form-key";

export function TicketLookupForm() {
  const [state, action] = useActionState<FormState, FormData>(lookupTicket, { ok: false });
  const key = useFormKey(state);
  const v = state.values || {};
  const e = state.errors || {};
  return (
    <form key={key} action={action} noValidate className="space-y-5">
      <FormMessage message={state.message} />
      <TextField name="reference" label="Ticket reference" required placeholder="NTSO-T-261011-ABC234" defaultValue={v.reference} error={e.reference} autoComplete="off" />
      <TextField name="email" type="email" label="Email used on the ticket" required autoComplete="email" defaultValue={v.email} error={e.email} />
      <TextField name="accessKey" type="password" label="Access key" required autoComplete="off" error={e.accessKey} hint="Shown when the ticket was created and included in the confirmation email." />
      <SubmitButton pendingText="Checking…" className="w-full">
        <Search className="h-4 w-4" aria-hidden="true" /> View ticket
      </SubmitButton>
    </form>
  );
}
