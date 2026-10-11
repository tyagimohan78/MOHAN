import "server-only";

// Central, typed access to environment configuration. Secrets are only read server-side.
export const config = {
  appUrl: (process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  salesNotifyEmail: process.env.SALES_NOTIFY_EMAIL || "sales@NTSO.in",
  supportNotifyEmail: process.env.SUPPORT_NOTIFY_EMAIL || process.env.SALES_NOTIFY_EMAIL || "sales@NTSO.in",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || "NTSO Private Limited <no-reply@ntso.in>",
  },
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  storage: {
    driver: (process.env.STORAGE_DRIVER || "local") as "local" | "s3",
    localDir: process.env.UPLOAD_DIR || "./uploads",
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION || "auto",
    s3Endpoint: process.env.S3_ENDPOINT,
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024,
  sessionDays: Number(process.env.ADMIN_SESSION_DAYS || 7),
  // The app is expected to run behind a reverse proxy / platform that sets X-Real-IP or X-Forwarded-For.
  trustProxy: process.env.TRUST_PROXY !== "false",
};

export const emailConfigured = () => Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
