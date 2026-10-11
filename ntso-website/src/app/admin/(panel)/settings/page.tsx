import { AdminHeader, Card } from "@/components/admin/ui";
import { SettingsForm, TestEmailForm } from "@/components/admin/forms";
import { headers } from "next/headers";
import { describeClientIp } from "@/lib/server/request";
import { checkStorageWritable } from "@/lib/server/storage";
import { Notice } from "@/components/ui/notice";
import { requirePage } from "@/lib/server/auth";
import { getSettings, SETTING_KEYS } from "@/lib/server/settings";
import { config, emailConfigured } from "@/lib/server/config";

export const metadata = { title: "Website settings" };

export default async function SettingsAdmin() {
  await requirePage("settings");
  const values = await getSettings();
  const [client, storage, h] = await Promise.all([describeClientIp(), checkStorageWritable(), headers()]);
  const ipHeaders = ["cf-connecting-ip", "true-client-ip", "x-real-ip", "x-forwarded-for", "fly-client-ip"]
    .map((k) => [k, h.get(k)] as const)
    .filter(([, v]) => v);
  return (
    <>
      <AdminHeader title="Website settings" description="Contact details, business hours, social links and notices shown on the public website." />
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <Notice tone={emailConfigured() ? "success" : "warning"} title="Email delivery">{emailConfigured() ? `SMTP configured. Notifications go to ${config.salesNotifyEmail}.` : "SMTP is not configured — set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and EMAIL_FROM."}</Notice>
        <Notice title="Storage">{config.storage.driver === "s3" ? `S3-compatible storage (bucket ${config.storage.s3Bucket || "not set"}).` : "Local disk storage. Use S3-compatible storage for multi-instance or serverless hosting."}</Notice>
      </div>
      <Card><SettingsForm values={values} labels={SETTING_KEYS} /></Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Test email delivery">
          <p className="mb-4 text-sm text-slate-600">Sends a test message to your own admin email address using the configured SMTP account.</p>
          <TestEmailForm />
        </Card>
        <Card title="Deployment diagnostics">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Your IP as detected by the website</dt>
              <dd className="font-mono text-navy-900">{client.ip} <span className="font-sans text-xs text-slate-500">(from {client.source})</span></dd>
              <dd className="mt-1 text-xs text-slate-500">This should match your real public IP (search “what is my IP”). If it shows a hosting/CDN address instead, set CLIENT_IP_HEADER to the header below that contains your real IP, so rate limits apply per visitor.</dd>
            </div>
            {ipHeaders.length > 0 && (
              <div>
                <dt className="text-slate-500">Proxy headers received on this request</dt>
                {ipHeaders.map(([k, v]) => (
                  <dd key={k} className="font-mono text-xs break-all text-navy-900">{k}: {v}</dd>
                ))}
              </div>
            )}
            <div>
              <dt className="text-slate-500">Upload storage</dt>
              <dd className={storage === "error" ? "font-semibold text-red-700" : "text-navy-900"}>
                {storage === "ok" ? "Writable" : storage === "not-checked" ? "S3-compatible bucket (not checked here)" : "NOT writable — ticket attachments and product images will fail"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
