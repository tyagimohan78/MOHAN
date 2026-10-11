"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound, Paperclip, Send, ShieldAlert } from "lucide-react";
import { submitTicket, type FormState } from "@/app/actions/public";
import { ticketCategories } from "@/lib/site";
import { BotProtection, Consent, FormMessage, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { SuccessPanel } from "./success-panel";
import { useFormKey } from "./use-form-key";
import { buttonClass } from "@/components/ui/button";

const priorities = [
  { value: "LOW", label: "Low — general question or minor inconvenience" },
  { value: "MEDIUM", label: "Medium — affects one user or a non-critical function" },
  { value: "HIGH", label: "High — affects several users or an important system" },
  { value: "CRITICAL", label: "Critical — business operations stopped" },
];

export function TicketForm() {
  const [state, action] = useActionState<FormState, FormData>(submitTicket, { ok: false });
  const key = useFormKey(state);

  if (state.ok && state.reference) {
    return (
      <SuccessPanel title="Your support ticket has been created" reference={state.reference}>
        <div className="mt-2 rounded-xl border border-navy-200 bg-white p-4">
          <p className="flex items-center gap-2 font-semibold text-navy-900">
            <KeyRound className="h-4 w-4 text-electric-600" aria-hidden="true" /> Your ticket access key
          </p>
          <p className="mt-2 font-mono text-base break-all text-navy-900">{state.accessKey}</p>
          <p className="mt-2 text-xs text-slate-500">
            Save this key now. With your reference number and email address it lets you check the ticket status and reply. It is also emailed to you when email delivery is configured. NTSO staff will never ask you for it.
          </p>
        </div>
        <p>
          Our support team will review the ticket. Response times depend on your support agreement; priority is confirmed by our team after review.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/support/ticket-status/${state.reference}`} className={buttonClass("secondary", "md")}>
            View ticket status
          </Link>
          <Link href="/support" className={buttonClass("outline", "md")}>
            Back to Support Center
          </Link>
        </div>
      </SuccessPanel>
    );
  }

  const v = state.values || {};
  const e = state.errors || {};
  return (
    <form key={key} action={action} noValidate encType="multipart/form-data" className="relative space-y-5">
      <FormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="customerName" label="Your name" required autoComplete="name" defaultValue={v.customerName} error={e.customerName} />
        <TextField name="companyName" label="Company name" required autoComplete="organization" defaultValue={v.companyName} error={e.companyName} />
        <TextField name="email" type="email" label="Business email" required autoComplete="email" defaultValue={v.email} error={e.email} />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        <SelectField name="category" label="Issue category" required options={ticketCategories} defaultValue={v.category} error={e.category} />
        <TextField name="affectedItem" label="Affected device or service" placeholder="e.g. Reception printer, Outlook on finance laptop" defaultValue={v.affectedItem} error={e.affectedItem} />
      </div>
      <TextField name="subject" label="Subject" required maxLength={160} defaultValue={v.subject} error={e.subject} />
      <TextArea
        name="description"
        label="Issue description"
        required
        rows={6}
        maxLength={6000}
        placeholder="What happened, when it started, who is affected, any error messages, and what you have already tried."
        defaultValue={v.description}
        error={e.description}
      />
      <SelectField name="priority" label="Priority" required options={priorities} defaultValue={v.priority ?? "MEDIUM"} error={e.priority} hint="Our team confirms the final priority after review." />
      <div>
        <label htmlFor="attachments" className="label">
          Attachments <span className="font-normal text-slate-400">(optional, up to 3 files, 5 MB each)</span>
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 p-3">
          <Paperclip className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            id="attachments"
            name="attachments"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,application/pdf"
            aria-describedby="attachments-help"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-100"
          />
        </div>
        <p id="attachments-help" className={`mt-1.5 text-xs ${e.attachments ? "font-medium text-red-600" : "text-slate-500"}`}>
          {e.attachments || "Screenshots (PNG, JPG, WebP) or PDF only. Re-select files if the form shows an error."}
        </p>
      </div>
      <p className="flex gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> Never include passwords, MFA codes, license keys or other secrets. If access is needed, our engineer will arrange it securely with you.
      </p>
      <BotProtection />
      <Consent error={e.consent} defaultChecked={v.consent === "on"}>
        I confirm the information is accurate and agree to NTSO processing it to provide support (see the{" "}
        <Link href="/privacy-policy" className="font-medium text-electric-700 underline">privacy policy</Link>).
      </Consent>
      <SubmitButton pendingText="Creating ticket…">
        Submit ticket <Send className="h-4 w-4" aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
