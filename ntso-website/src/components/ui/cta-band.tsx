import { ArrowRight, Mail } from "lucide-react";
import { ButtonLink } from "./button";
import { site } from "@/lib/site";

export function CtaBand({
  title = "Tell us what your business needs",
  text = "Share your requirement and our team will respond with options, a quotation or next steps. There is no obligation.",
  primary = { label: "Request a Quote", href: "/request-quote" },
  secondary,
}: { title?: string; text?: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string } }) {
  return (
    <section className="bg-white py-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 px-6 py-12 sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-electric-500/25 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
              <p className="mt-3 text-navy-200">{text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={primary.href} size="lg">
                {primary.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              {secondary ? (
                <ButtonLink href={secondary.href} variant="outline-light" size="lg">
                  {secondary.label}
                </ButtonLink>
              ) : (
                <ButtonLink href={`mailto:${site.salesEmail}`} variant="outline-light" size="lg">
                  <Mail className="h-4 w-4" aria-hidden="true" /> {site.salesEmail}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
