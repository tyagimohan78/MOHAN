import "server-only";
import { config } from "./config";

export const HONEYPOT_FIELD = "company_website";
export const STARTED_FIELD = "form_started";
const MIN_FILL_MS = 2500;

/**
 * Bot checks for public forms: honeypot field, minimum time-to-fill, and
 * optional Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is set.
 */
export async function checkSpam(form: FormData, ip: string): Promise<string | null> {
  if (String(form.get(HONEYPOT_FIELD) || "").trim() !== "") return "Submission rejected.";
  const started = Number(form.get(STARTED_FIELD));
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) {
    return "The form was submitted too quickly. Please review your details and try again.";
  }
  if (config.turnstileSecret) {
    const token = String(form.get("cf-turnstile-response") || "");
    if (!token) return "Please complete the verification challenge.";
    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({ secret: config.turnstileSecret, response: token, remoteip: ip }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (!data.success) return "Verification failed. Please try again.";
    } catch {
      return "Verification service unavailable. Please try again shortly.";
    }
  }
  return null;
}
