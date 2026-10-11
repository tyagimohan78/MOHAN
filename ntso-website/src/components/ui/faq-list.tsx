import { ChevronDown } from "lucide-react";
import { JsonLd } from "./json-ld";

export type FaqItem = { question: string; answer: string };

/** Native <details> accordion: keyboard accessible without JavaScript. */
export function FaqList({ items, withSchema = true }: { items: FaqItem[]; withSchema?: boolean }) {
  if (!items.length) return null;
  return (
    <>
      <div className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white shadow-card">
        {items.map((f, i) => (
          <details key={i} className="group px-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-navy-900 hover:text-electric-700">
              {f.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="-mt-1 pb-5 leading-7 whitespace-pre-line text-slate-600">{f.answer}</p>
          </details>
        ))}
      </div>
      {withSchema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      )}
    </>
  );
}
