"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { submitSurvey, type FormState } from "@/app/actions/public";
import { BotProtection, Consent, FormMessage, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { SuccessPanel } from "./success-panel";
import { useFocusFirstError, useFormKey } from "./use-form-key";

const types = ["CCTV site survey", "Network / cabling site survey", "IT infrastructure audit", "Network consultation"] as const;
const siteTypes = ["Corporate office", "Factory / plant", "Warehouse", "Hospital / clinic", "School / college", "Retail store", "Multi-site / branches", "Other"];

export function SurveyForm({ defaultType = "Network / cabling site survey", sourcePage }: { defaultType?: (typeof types)[number]; sourcePage: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitSurvey, { ok: false });
  const key = useFormKey(state);
  useFocusFirstError(state, "survey-form");
  if (state.ok) {
    return (
      <SuccessPanel title="Request received" reference={state.reference}>
        <p>Our team will contact you to understand the site and agree a suitable visit or call. Survey scope, scheduling and any charges are confirmed with you before the visit.</p>
      </SuccessPanel>
    );
  }
  const v = state.values || {};
  const e = state.errors || {};
  return (
    <form id="survey-form" key={key} action={action} noValidate className="relative space-y-5">
      <FormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="surveyType" label="Request type" required options={types} defaultValue={v.surveyType ?? defaultType} error={e.surveyType} />
        <SelectField name="siteType" label="Site type" options={siteTypes} defaultValue={v.siteType} error={e.siteType} />
        <TextField name="fullName" label="Full name" required autoComplete="name" defaultValue={v.fullName} error={e.fullName} />
        <TextField name="companyName" label="Company name" required autoComplete="organization" defaultValue={v.companyName} error={e.companyName} />
        <TextField name="email" type="email" label="Work email" required autoComplete="email" defaultValue={v.email} error={e.email} />
        <TextField name="phone" type="tel" label="Mobile number" required autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        <TextField name="city" label="Site city" required defaultValue={v.city} error={e.city} />
        <TextField name="preferredDate" type="date" label="Preferred date" defaultValue={v.preferredDate} error={e.preferredDate} />
      </div>
      <TextArea name="requirement" label="Site and requirement details" required rows={5} placeholder="Approximate area, number of floors, number of users/cameras/network points, existing equipment, and what you want to achieve." defaultValue={v.requirement} error={e.requirement} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <BotProtection />
      <Consent error={e.consent} defaultChecked={v.consent === "on"}>
        I agree to NTSO using these details to respond to my request (see the{" "}
        <Link href="/privacy-policy" className="font-medium text-electric-700 underline">privacy policy</Link>).
      </Consent>
      <SubmitButton pendingText="Submitting…">
        <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Submit request
      </SubmitButton>
    </form>
  );
}
