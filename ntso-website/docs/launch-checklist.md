# NTSO.in — Pre-launch checklist

For the deployment walkthrough (Render, Zoho Mail, Brevo, DNS) see [`deploy-render.md`](deploy-render.md).

Items marked ☐ need credentials, a business decision or verification before launch. The code side of every item is already built.

## A. Integrations that need credentials or configuration

| # | Integration | What to provide | Where |
|---|---|---|---|
| ☐ A1 | **PostgreSQL** (production) | Managed DB or self-hosted, backups enabled, restore tested | `DATABASE_URL` |
| ☐ A2 | **SMTP / transactional email** | Provider account, SMTP host/port/user/password, verified sending domain | `SMTP_*`, `EMAIL_FROM` |
| ☐ A3 | **Email DNS** for ntso.in | SPF, DKIM and DMARC records from the email provider | DNS |
| ☐ A4 | **Notification recipients** | Confirm that `sales@NTSO.in` exists and is monitored. Optionally set a separate support mailbox | `SALES_NOTIFY_EMAIL`, `SUPPORT_NOTIFY_EMAIL` |
| ☐ A5 | **File storage** | Private S3/R2 bucket and access keys (required on serverless or multi-instance hosting), or a persistent disk volume | `STORAGE_DRIVER`, `S3_*` / `UPLOAD_DIR` |
| ☐ A6 | **Domain and HTTPS** | DNS A/CNAME records for `ntso.in` and `www`, plus a TLS certificate (automatic with Caddy or the platform) | DNS, proxy |
| ☐ A7 | **Public URL at build time** | `https://ntso.in` | `APP_URL`, `NEXT_PUBLIC_SITE_URL` |
| ☐ A8 | **Admin accounts** | Create real staff accounts with strong unique passwords; give staff the least-privilege role they need | `npm run admin:create`, then `/admin/users` |
| ☐ A9 | **Bot protection** (optional, recommended) | Cloudflare Turnstile site key and secret | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| ☐ A10 | **Scheduled maintenance** | Daily `npm run maintenance` job; optionally `AUDIT_LOG_RETENTION_DAYS` | cron / platform scheduler |
| ☐ A13 | **Uptime monitoring** | Monitor `https://ntso.in/api/health` (expects HTTP 200) | uptime service / load balancer |
| ☐ A11 | **Analytics** (optional) | A privacy-friendly tool (e.g. Plausible or self-hosted Umami). Update the CSP and privacy policy when adding it | `next.config.ts`, `/privacy-policy` |
| ☐ A12 | **Google Search Console / Bing Webmaster** | Verify the domain and submit `https://ntso.in/sitemap.xml` | DNS TXT |

## B. Business information to verify and enter (Admin → Website settings)

- ☐ Business hours (hidden until set)
- ☐ Public phone or WhatsApp number (hidden until set)
- ☐ Official business address, plus the Google Maps embed URL if wanted (hidden until set)
- ☐ GSTIN and CIN (publish only once verified; both formats are validated)
- ☐ Real social media profile URLs (hidden until set)

## C. Content review

- ☐ Review all **55 sample listings** (Admin → Products, "Sample only" filter). Confirm the vendor plan names, editions and availability in India, edit them, then untick "Sample listing" or unpublish.
- ☐ Confirm which vendors NTSO can actually procure from. Update `/vendors` (`src/app/(site)/vendors/page.tsx`) and the brand mentions in sample products.
- ☐ Add partner or reseller badges **only** where authorisation is documented.
- ☐ Review service listings (Admin → Services), especially the "delivered via partner" labels.
- ☐ Review the FAQs (Admin → FAQs).
- ☐ Replace the illustrative category icons with licensed product photography if wanted (Admin → Products → image upload).
- ☐ Confirm or adjust the IT AMC models on `/it-services/amc-plans`. Add SLA wording only after support SLAs are defined in contracts.

## D. Legal

- ☐ Have counsel review and customise: Privacy Policy (including Digital Personal Data Protection Act, 2023 obligations and a grievance contact), Terms, Shipping, Returns and Refunds, and Warranty and RMA. Fill every `[placeholder]` and "last updated" date, then remove the "Draft for review" banner (`src/components/ui/legal-page.tsx`).
- ☐ Decide data-retention periods for enquiries, tickets and attachments, and configure a periodic clean-up job if required.

## E. Final technical checks

- ☐ `npm run lint && npm run typecheck && npm test && npm run build` pass
- ☐ Run `npm run test:integration`, `npm run test:e2e` and `npm run test:a11y` against staging (or confirm the GitHub Actions run is green)
- ☐ Submit a real quote and a real ticket on production; confirm that both emails arrive and are not marked as spam
- ☐ Check the security headers with securityheaders.com and the TLS setup with SSL Labs
- ☐ Lighthouse (mobile): Performance, Accessibility, Best Practices and SEO are all green
- ☐ Delete the development or test admin accounts and the test records
- ☐ Confirm database backups run and a restore works
- ☐ Re-run `npm audit` and upgrade dependencies where patches are available
