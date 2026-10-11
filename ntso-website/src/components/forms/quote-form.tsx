"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { submitQuote, type FormState } from "@/app/actions/public";
import { contactMethods, licenseDurations, quoteCategories } from "@/lib/site";
import { BotProtection, Consent, FormMessage, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { useFocusFirstError, useFormKey } from "./use-form-key";

export function QuoteForm({ defaults = {}, sourcePage = "/request-quote" }: { defaults?: { category?: string; productName?: string }; sourcePage?: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitQuote, { ok: false });
  const key = useFormKey(state);
  useFocusFirstError(state, "quote-form");
  const v = state.values || {};
  const e = state.errors || {};
  return (
    <form id="quote-form" key={key} action={action} noValidate className="relative space-y-5" aria-describedby="quote-form-status">
      <div id="quote-form-status">
        <FormMessage message={state.message} ok={state.ok} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" label="Full name" required autoComplete="name" defaultValue={v.fullName} error={e.fullName} maxLength={120} />
        <TextField name="companyName" label="Company name" required autoComplete="organization" defaultValue={v.companyName} error={e.companyName} maxLength={160} />
        <TextField name="email" type="email" label="Work email" required autoComplete="email" inputMode="email" defaultValue={v.email} error={e.email} maxLength={200} />
        <TextField name="phone" type="tel" label="Mobile number" required autoComplete="tel" inputMode="tel" placeholder="+91 98xxx xxxxx" defaultValue={v.phone} error={e.phone} maxLength={20} />
        <TextField name="city" label="City" required autoComplete="address-level2" defaultValue={v.city} error={e.city} maxLength={80} />
        <SelectField name="category" label="Product or service category" required options={quoteCategories} defaultValue={v.category ?? defaults.category} error={e.category} />
        <TextField name="productName" label="Product or license name" placeholder="e.g. Microsoft 365 Business Standard" defaultValue={v.productName ?? defaults.productName} error={e.productName} maxLength={200} />
        <div className="grid grid-cols-2 gap-4">
          <TextField name="quantity" type="number" label="Quantity" inputMode="numeric" min={1} max={100000} defaultValue={v.quantity} error={e.quantity} />
          <SelectField name="licenseDuration" label="License duration" options={licenseDurations} defaultValue={v.licenseDuration} error={e.licenseDuration} placeholder="—" />
        </div>
      </div>
      <TextArea
        name="requirement"
        label="Brief requirement"
        required
        rows={5}
        placeholder="Tell us what you need: number of users or devices, current setup, timelines, delivery location, or any preferred brands."
        defaultValue={v.requirement}
        error={e.requirement}
      />
      <fieldset>
        <legend className="label">
          Preferred contact method <span className="text-red-600" aria-hidden="true">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {contactMethods.map((m) => (
            <label key={m} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm has-[:checked]:border-electric-500 has-[:checked]:bg-electric-500/10 has-[:checked]:text-navy-900">
              <input type="radio" name="preferredContact" value={m} data-invalid={e.preferredContact ? "true" : undefined} aria-describedby={e.preferredContact ? "preferredContact-error" : undefined} defaultChecked={(v.preferredContact || "Email") === m} className="accent-electric-600" />
              {m}
            </label>
          ))}
        </div>
        {e.preferredContact && <p id="preferredContact-error" className="mt-1.5 text-xs font-medium text-red-600">{e.preferredContact}</p>}
      </fieldset>
      <p className="flex gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> Please do not include passwords, license keys or other credentials in this form.
      </p>
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <BotProtection />
      <Consent error={e.consent} defaultChecked={v.consent === "on"}>
        I agree that NTSO may store and use these details to respond to my enquiry, as described in the{" "}
        <Link href="/privacy-policy" className="font-medium text-electric-700 underline">
          privacy policy
        </Link>
        .
      </Consent>
      <SubmitButton pendingText="Sending request…" className="w-full sm:w-auto">
        Submit quote request <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
