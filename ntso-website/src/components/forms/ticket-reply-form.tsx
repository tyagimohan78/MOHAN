"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { customerReply, type FormState } from "@/app/actions/public";
import { FormMessage, SubmitButton, TextArea } from "./fields";
import { useFocusFirstError, useFormKey } from "./use-form-key";

export function TicketReplyForm({ reference }: { reference: string }) {
  const [state, action] = useActionState<FormState, FormData>(customerReply.bind(null, reference), { ok: false });
  const key = useFormKey(state);
  useFocusFirstError(state, "ticket-reply-form");
  return (
    <form id="ticket-reply-form" key={key} action={action} className="space-y-4">
      <FormMessage message={state.message} ok={state.ok} />
      <TextArea name="body" label="Add a reply" required rows={4} maxLength={6000} error={state.errors?.body} placeholder="Add information or answer a question from our team. Do not include passwords." />
      <SubmitButton pendingText="Sending…">
        Send reply <Send className="h-4 w-4" aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
