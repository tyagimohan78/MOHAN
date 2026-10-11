"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Headset, Mail, Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { mainNav, site, type NavItem } from "@/lib/site";

const isActive = (pathname: string, item: NavItem) =>
  item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/") || !!item.children?.some((c) => !c.href.includes("#") && c.href !== "/" && pathname.startsWith(c.href));

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const enter = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${site.name} — home`} className="rounded-md">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href={`mailto:${site.salesEmail}`} className="hidden items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-900 lg:inline-flex">
            <Mail className="h-4 w-4 text-electric-600" aria-hidden="true" /> {site.salesEmail}
          </a>
          <span className="hidden sm:block">
            <Link href="/support/new-ticket" className={buttonClass("outline", "sm")}>
              <Headset className="h-4 w-4" aria-hidden="true" /> Get IT Support
            </Link>
          </span>
          <Link href="/request-quote" className={buttonClass("primary", "sm")}>
            Request a Quote
          </Link>
          <button
            type="button"
            className="inline-grid h-10 w-10 place-items-center rounded-lg text-navy-900 hover:bg-navy-50 xl:hidden"
            aria-expanded={mobile}
            aria-controls="mobile-nav"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            <span className="sr-only">{mobile ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="hidden border-t border-navy-100 xl:block" ref={navRef}>
        <nav aria-label="Main" className="container-page">
          <ul className="flex items-center justify-between">
            {mainNav.map((item, i) => {
              const active = isActive(pathname, item);
              const cls = `relative inline-flex h-12 items-center gap-1 px-2.5 text-[13.5px] font-semibold transition-colors ${active ? "text-navy-900" : "text-slate-600 hover:text-navy-900"}`;
              const underline = <span className={`absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-electric-500 transition-opacity ${active ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />;
              if (!item.children) {
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cls} aria-current={pathname === item.href ? "page" : undefined}>
                      {item.label}
                      {underline}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.href} className="relative" onMouseEnter={() => enter(i)} onMouseLeave={leave}>
                  <button type="button" className={cls} aria-expanded={open === i} aria-haspopup="true" onClick={() => setOpen(open === i ? null : i)}>
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition ${open === i ? "rotate-180" : ""}`} aria-hidden="true" />
                    {underline}
                  </button>
                  {open === i && (
                    <div className="absolute top-full left-1/2 z-50 w-80 -translate-x-1/2 pt-2">
                      <ul className="animate-fade-up rounded-xl border border-navy-100 bg-white p-2 shadow-lift [animation-duration:.18s]">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="block rounded-lg px-3 py-2.5 hover:bg-navy-50 focus-visible:bg-navy-50" onClick={() => setOpen(null)}>
                              <span className="block text-sm font-semibold text-navy-900">{c.label}</span>
                              {c.description && <span className="mt-0.5 block text-xs text-slate-500">{c.description}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile navigation */}
      {mobile && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-navy-100 bg-white xl:hidden">
          <nav aria-label="Mobile" className="container-page py-4">
            <ul className="divide-y divide-navy-100">
              {mainNav.map((item, i) => (
                <li key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3.5 text-left text-base font-semibold text-navy-900"
                        aria-expanded={mobileSection === i}
                        onClick={() => setMobileSection(mobileSection === i ? null : i)}
                      >
                        {item.label}
                        <ChevronDown className={`h-5 w-5 transition ${mobileSection === i ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                      {mobileSection === i && (
                        <ul className="mb-3 space-y-1 rounded-xl bg-navy-50 p-2">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} onClick={() => setMobile(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-white">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} onClick={() => setMobile(false)} className="block py-3.5 text-base font-semibold text-navy-900">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/request-quote" className={buttonClass("primary", "lg")}>
                Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/support/new-ticket" className={buttonClass("outline", "lg")}>
                <Headset className="h-4 w-4" aria-hidden="true" /> Get IT Support
              </Link>
              <a href={`mailto:${site.salesEmail}`} className={buttonClass("ghost", "lg", "sm:col-span-2")}>
                <Mail className="h-4 w-4" aria-hidden="true" /> {site.salesEmail}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
