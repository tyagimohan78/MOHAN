import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-electric-500 text-navy-950 shadow-sm hover:bg-electric-400 hover:shadow-[0_8px_24px_-8px_rgb(6_182_212/0.7)] focus-visible:outline-electric-500",
  secondary: "bg-navy-900 text-white shadow-sm hover:bg-navy-800 focus-visible:outline-navy-900",
  outline: "border border-navy-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50",
  ghost: "text-navy-800 hover:bg-navy-50",
  light: "bg-white text-navy-900 hover:bg-navy-50",
  "outline-light": "border border-white/30 text-white hover:border-white/60 hover:bg-white/10",
};
const sizes: Record<Size, string> = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" };

export const buttonClass = (variant: Variant = "primary", size: Size = "md", extra = "") => `${base} ${variants[variant]} ${sizes[size]} ${extra}`;

export function ButtonLink({ href, variant, size, className = "", children, ...rest }: { href: string; variant?: Variant; size?: Size; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href">) {
  const external = /^(mailto:|tel:|https?:)/.test(href);
  if (external) {
    return (
      <a href={href} className={buttonClass(variant, size, className)} {...(rest as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant, size, className = "", ...rest }: { variant?: Variant; size?: Size } & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}
