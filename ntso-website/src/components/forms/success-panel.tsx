import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

export function SuccessPanel({ title, reference, children }: { title: string; reference?: string; children?: ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
      <CircleCheck className="h-10 w-10 text-emerald-600" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-bold">{title}</h2>
      {reference && (
        <p className="mt-3 text-slate-700">
          Your reference number is{" "}
          <strong className="rounded-md bg-white px-2 py-0.5 font-mono text-navy-900 ring-1 ring-emerald-200">{reference}</strong>. Please quote it in any follow-up.
        </p>
      )}
      <div className="mt-3 space-y-2 text-sm text-slate-600">{children}</div>
    </div>
  );
}
