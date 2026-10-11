"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

type Common = { name: string; label: string; required?: boolean; error?: string; hint?: string; className?: string };

function FieldWrap({ name, label, required, error, hint, className = "", children }: Common & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label} {required ? <span className="text-red-600" aria-hidden="true">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: string) => (error ? `${name}-error` : hint ? `${name}-hint` : undefined);

export function TextField({ type = "text", defaultValue, placeholder, autoComplete, inputMode, maxLength, min, max, ...c }: Common & { type?: string; defaultValue?: string; placeholder?: string; autoComplete?: string; inputMode?: "text" | "email" | "tel" | "numeric"; maxLength?: number; min?: number; max?: number }) {
  return (
    <FieldWrap {...c}>
      <input
        id={c.name}
        name={c.name}
        type={type}
        required={c.required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        max={max}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className="input"
      />
    </FieldWrap>
  );
}

export function TextArea({ defaultValue, placeholder, rows = 5, maxLength = 4000, ...c }: Common & { defaultValue?: string; placeholder?: string; rows?: number; maxLength?: number }) {
  return (
    <FieldWrap {...c}>
      <textarea
        id={c.name}
        name={c.name}
        required={c.required}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className="input resize-y"
      />
    </FieldWrap>
  );
}

export function SelectField({ options, defaultValue, placeholder = "Select…", ...c }: Common & { options: readonly (string | { value: string; label: string })[]; defaultValue?: string; placeholder?: string }) {
  return (
    <FieldWrap {...c}>
      <select
        id={c.name}
        name={c.name}
        required={c.required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className="input"
      >
        <option value="" disabled={c.required}>
          {placeholder}
        </option>
        {options.map((o) => {
          const v = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          );
        })}
      </select>
    </FieldWrap>
  );
}

export function Consent({ error, defaultChecked, children }: { error?: string; defaultChecked?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="consent" required defaultChecked={defaultChecked} aria-invalid={error ? true : undefined} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-electric-600" />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/** Hidden anti-bot fields: a honeypot and the time the form was rendered. Optional Turnstile widget. */
export function BotProtection() {
  const [started, setStarted] = useState("");
  useEffect(() => setStarted(String(Date.now())), []);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="form_started" value={started} />
      {siteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
        </>
      )}
    </>
  );
}

export function SubmitButton({ children, pendingText = "Submitting…", className = "" }: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonClass("primary", "lg", className)}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ message, ok }: { message?: string; ok?: boolean }) {
  if (!message) return null;
  return (
    <div role={ok ? "status" : "alert"} className={`rounded-lg border px-4 py-3 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-800"}`}>
      {message}
    </div>
  );
}
