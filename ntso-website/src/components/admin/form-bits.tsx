"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useTransition, type ComponentProps, type ReactNode } from "react";

const PendingContext = createContext(false);

/**
 * A form that dispatches a server action without React's automatic post-action form reset,
 * so admins keep their edits (including selected files) when validation fails.
 */
export function ActionForm({ action, children, ...rest }: { action: (fd: FormData) => void } & Omit<ComponentProps<"form">, "action" | "onSubmit">) {
  const [pending, start] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        {...rest}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(() => action(fd));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}
import { buttonClass } from "@/components/ui/button";

export function SaveButton({ children = "Save changes", variant = "secondary" as const }: { children?: ReactNode; variant?: "secondary" | "primary" }) {
  const status = useFormStatus();
  const pending = useContext(PendingContext) || status.pending;
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, "md")}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {children}
    </button>
  );
}

export function ConfirmButton({ children, message, className = "" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className || "rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, name, error, children, hint }: { label: string; name: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-navy-900">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded accent-electric-600" /> {label}
    </label>
  );
}
