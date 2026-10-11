"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { submitRenewal, type FormState } from "@/app/actions/public";
import { BotProtection, Consent, FormMessage, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { SuccessPanel } from "./success-panel";
import { useFormKey } from "./use-form-key";

const vendors = ["Microsoft", "Sophos", "Fortinet", "Cisco", "ESET", "Bitdefender", "Veeam", "Acronis", "VMware / Broadcom", "Adobe", "Other"];

export function RenewalForm({ defaultProduct }: { defaultProduct?: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitRenewal, { ok: false });
  const key = useFormKey(state);
  if (state.ok) {
    return (
      <SuccessPanel title="Renewal enquiry received" reference={state.reference}>
        <p>Our team will review your subscription details and contact you with renewal options. Please keep your existing license or subscription information handy — but never share license keys or admin passwords by email.</p>
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
        <TextField name="companyName" label="Company name" required autoComplete="organization" defaultValue={v.companyName} error={e.companyName} />
        <TextField name="email" type="email" label="Work email" required autoComplete="email" defaultValue={v.email} error={e.email} />
        <TextField name="phone" type="tel" label="Mobile number" required autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        <SelectField name="vendor" label="Vendor / product family" required options={vendors} defaultValue={v.vendor} error={e.vendor} />
        <TextField name="productName" label="Product or subscription name" required placeholder="e.g. Sophos Intercept X Advanced" defaultValue={v.productName ?? defaultProduct} error={e.productName} />
        <TextField name="quantity" type="number" label="Users / devices" min={1} defaultValue={v.quantity} error={e.quantity} />
        <TextField name="expiryDate" type="date" label="Current expiry date" defaultValue={v.expiryDate} error={e.expiryDate} />
        <TextField name="city" label="City" defaultValue={v.city} error={e.city} />
        <TextField name="currentProvider" label="Purchased from (current provider)" defaultValue={v.currentProvider} error={e.currentProvider} />
      </div>
      <TextArea name="requirement" label="Additional details" rows={4} placeholder="Changes in user count, upgrade interest, consolidation of renewal dates, etc." defaultValue={v.requirement} error={e.requirement} />
      <BotProtection />
      <Consent error={e.consent} defaultChecked={v.consent === "on"}>
        I agree to NTSO using these details to respond to my renewal enquiry (see the{" "}
        <Link href="/privacy-policy" className="font-medium text-electric-700 underline">privacy policy</Link>).
      </Consent>
      <SubmitButton pendingText="Submitting…">
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> Submit renewal enquiry
      </SubmitButton>
    </form>
  );
}
