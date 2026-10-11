import { AdminHeader, Card } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/forms";
import { Notice } from "@/components/ui/notice";
import { requirePage } from "@/lib/server/auth";
import { getSettings, SETTING_KEYS } from "@/lib/server/settings";
import { config, emailConfigured } from "@/lib/server/config";

export const metadata = { title: "Website settings" };

export default async function SettingsAdmin() {
  await requirePage("settings");
  const values = await getSettings();
  return (
    <>
      <AdminHeader title="Website settings" description="Contact details, business hours, social links and notices shown on the public website." />
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <Notice tone={emailConfigured() ? "success" : "warning"} title="Email delivery">{emailConfigured() ? `SMTP configured. Notifications go to ${config.salesNotifyEmail}.` : "SMTP is not configured — set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and EMAIL_FROM."}</Notice>
        <Notice title="Storage">{config.storage.driver === "s3" ? `S3-compatible storage (bucket ${config.storage.s3Bucket || "not set"}).` : "Local disk storage. Use S3-compatible storage for multi-instance or serverless hosting."}</Notice>
      </div>
      <Card><SettingsForm values={values} labels={SETTING_KEYS} /></Card>
    </>
  );
}
