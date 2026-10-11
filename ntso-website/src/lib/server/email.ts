import "server-only";
import { logger } from "./logger";
import nodemailer, { type Transporter } from "nodemailer";
import { config, emailConfigured } from "./config";

export type MailResult = "SENT" | "FAILED" | "NOT_CONFIGURED";

let transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!emailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Build a simple, safe HTML email from heading, paragraphs and a key/value table. All values are escaped. */
export function renderEmail(opts: { heading: string; intro?: string[]; rows?: [string, string | number | null | undefined][]; outro?: string[] }) {
  const rows = (opts.rows || []).filter(([, v]) => v !== undefined && v !== null && v !== "");
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0b1f3a;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:700">NTSO<span style="color:#22d3ee">.</span> <span style="font-weight:400;font-size:14px;color:#cbd5e1">Private Limited</span></td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:20px">${escapeHtml(opts.heading)}</h1>
${(opts.intro || []).map((p) => `<p style="margin:0 0 12px;line-height:1.5">${escapeHtml(p)}</p>`).join("")}
${rows.length ? `<table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="border-bottom:1px solid #e2e8f0;color:#475569;width:38%;vertical-align:top">${escapeHtml(k)}</td><td style="border-bottom:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`)
    .join("")}</table>` : ""}
${(opts.outro || []).map((p) => `<p style="margin:0 0 12px;line-height:1.5;color:#475569;font-size:14px">${escapeHtml(p)}</p>`).join("")}
</td></tr><tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px">NTSO Private Limited · ntso.in · sales@NTSO.in</td></tr>
</table></td></tr></table></body></html>`;
  const textBody = [
    opts.heading,
    "",
    ...(opts.intro || []),
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    ...(opts.outro || []),
    "",
    "NTSO Private Limited · ntso.in · sales@NTSO.in",
  ].join("\n");
  return { html, text: textBody };
}

export async function sendMail(msg: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<MailResult> {
  const t = getTransporter();
  if (!t) {
    if (process.env.NODE_ENV !== "production") {
      logger.info("email.not_configured", { subject: msg.subject });
    }
    return "NOT_CONFIGURED";
  }
  try {
    await t.sendMail({ from: config.smtp.from, ...msg, subject: msg.subject.replace(/[\r\n]+/g, " ") });
    return "SENT";
  } catch (err) {
    logger.error("email.send_failed", { subject: msg.subject }, err);
    return "FAILED";
  }
}
