import type { Service } from "@prisma/client";
import { Check } from "lucide-react";
import { groupBy } from "@/lib/server/catalog";
import { Badge } from "./notice";

const deliveryBadge = {
  DIRECT: null,
  PARTNER: <Badge tone="amber">Delivered via partner</Badge>,
  DIRECT_OR_PARTNER: <Badge tone="slate">NTSO and/or partner</Badge>,
} as const;

/** Renders DB-managed services grouped by their group heading. */
export function ServiceGroups({ services, showDelivery = false, columns = 2 }: { services: Service[]; showDelivery?: boolean; columns?: 2 | 3 }) {
  const groups = groupBy(services, (s) => s.group);
  return (
    <div className={`grid gap-6 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
      {groups.map(([group, items]) => (
        <div key={group} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-7">
          <h3 className="flex items-center gap-3 text-lg font-bold">
            <span className="h-6 w-1 rounded-full bg-electric-500" aria-hidden="true" />
            {group}
          </h3>
          <ul className="mt-5 space-y-4">
            {items.map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-electric-500/15 text-electric-700">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy-900">
                    {s.name} {showDelivery && deliveryBadge[s.delivery]}
                  </p>
                  <p className="mt-0.5 text-sm leading-6 text-slate-600">{s.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
