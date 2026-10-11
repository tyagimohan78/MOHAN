# NTSO Private Limited — Website

Production-ready B2B website for **NTSO Private Limited** (https://ntso.in). It covers IT solutions, software licensing, hardware, networking, cloud, cybersecurity, CCTV and technical support, with:

- a quote-based sales workflow: quote, contact, license-renewal, site-survey and consultation enquiries. Every enquiry is saved to PostgreSQL, gets a unique reference number and triggers email notifications.
- a support ticket system: customers get a ticket reference and a private access key, can see status and reply, and can upload attachments.
- a protected admin dashboard with role-based access and an audit log.
- an SEO foundation: per-page metadata, canonical URLs, sitemap, robots.txt, Open Graph tags, JSON-LD and breadcrumbs.

---

## 1. Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19 Server Components, Server Actions), TypeScript (strict) |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css`, self-hosted Inter and Plus Jakarta Sans fonts |
| Database | PostgreSQL 14+ through Prisma ORM (parameterised queries) |
| Auth (admin) | Database-backed sessions (random 256-bit token; only its SHA-256 hash is stored), bcrypt (cost 12) password hashing, httpOnly SameSite cookies, role-based permissions checked on the server for every page, action and route |
| Validation | Zod schemas on the server (`src/lib/validation.ts`) |
| Email | SMTP through Nodemailer. Works with any transactional provider |
| File storage | Local disk (dev or single server) or any S3-compatible bucket (AWS S3, Cloudflare R2, …) |
| Tests | Vitest unit tests; Playwright end-to-end journey suite |

Why not a simpler static site? The brief needs saved enquiries, a ticket workflow, customer-only ticket access, and an admin panel. Those need a server and a database. Next.js keeps the public pages fast (server-rendered, about 106 kB of shared JavaScript) and runs the backend in the same deployable app.

## 2. Sitemap and architecture

```
/                                   Homepage (hero, solutions, featured products, why NTSO, infrastructure, industries, CTAs, FAQs, contact)
/about                              About Us
/products                           Hardware hub (grouped categories)
  /products/[category]              Category page + quote form
  /products/[category]/[product]    Product detail + quote form
/software-licensing                 Microsoft · Sophos · Other enterprise software (license cards)
  /software-licensing/[slug]        License detail + quote form
/license-renewal                    License renewal enquiry
/it-services                        Services hub
  /it-services/network-infrastructure   Networking, cabling, racks, audits + site survey form
  /it-services/cctv-surveillance        CCTV + site survey form
  /it-services/amc-plans                IT AMC models
  /it-services/it-procurement           Enterprise procurement
/cloud-solutions                    Azure / Microsoft 365; licensing vs migration vs management
/cybersecurity                      Security services (direct vs partner-delivered) + secure enquiry form
/industries                         8 industries
/support                            Support Center
  /support/new-ticket               Raise a ticket (attachments)
  /support/ticket-status            Look up a ticket (reference + email + access key)
  /support/ticket-status/[ref]      Customer ticket view + replies
/contact  /request-quote  /request-quote/confirmation
/vendors  /faqs  /careers
/privacy-policy  /terms  /shipping-policy  /returns-policy  /warranty-rma   (DRAFTS for legal review)
/sitemap.xml  /robots.txt  /icon.svg  /og-image.png

/admin/login
/admin                              Dashboard (role-aware)
/admin/enquiries[/id]  /admin/enquiries/export (CSV)
/admin/tickets[/id]    /admin/attachments/[id] (private downloads)
/admin/customers  /admin/products[/id|/new]  /admin/categories  /admin/services  /admin/faqs
/admin/settings  /admin/users  /admin/audit-log  /admin/account
```

```
src/
  app/
    (site)/            public pages (shared header/footer layout)
    admin/             login, (panel) pages, server actions, private routes
    actions/public.ts  public form server actions (rate limit → bot check → validate → save → notify)
    media/[...key]     public delivery of admin-uploaded product images
    sitemap.ts robots.ts icon.svg globals.css
  components/
    layout/  ui/  forms/  admin/  illustrations/
  content/marketing.ts     static marketing copy (industries, benefits, homepage cards)
  lib/
    site.ts                company facts, navigation, form option lists
    validation.ts          Zod schemas (shared with unit tests)
    seo.ts                 metadata + JSON-LD helpers
    server/                server-only business logic: db, auth, enquiries, tickets, email, storage,
                           rate-limit, spam, settings, audit, catalog, config
  middleware.ts            fast redirect for /admin without a session cookie
prisma/  schema.prisma  migrations/  seed.ts  seed-data.ts
scripts/create-admin.ts
tests/unit  tests/e2e
```

Business logic lives in `src/lib/server/*`. Pages and components only render. Database content (products, categories, services, FAQs, settings) is managed in the admin panel. Marketing copy that rarely changes lives in `src/content/marketing.ts`.

## 3. Local development

Prerequisites: Node.js 20.9+ (22 recommended) and PostgreSQL 14+.

```bash
cd ntso-website
cp .env.example .env              # then set DATABASE_URL (and APP_URL=http://localhost:3000)
npm install                       # also runs `prisma generate`
npx prisma migrate deploy         # create tables
npm run db:seed                   # categories, SAMPLE products/licenses, services, FAQs (idempotent)
ADMIN_EMAIL=you@ntso.in ADMIN_PASSWORD='Choose-A-Strong-Passw0rd' ADMIN_NAME='Mohan Tyagi' npm run admin:create
npm run dev                       # http://localhost:3000  — admin at /admin
```

When SMTP is not configured, enquiries and tickets are still saved. Their email status shows as "not configured", and in development the console logs each email that would have been sent.

### Quality checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
# End-to-end journeys (needs a running server and two admin accounts: ADMIN and SALES role)
BASE_URL=http://localhost:3000 E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_SALES_EMAIL=… E2E_SALES_PASSWORD=… \
  CHROMIUM_PATH=/path/to/chrome node tests/e2e/journeys.mjs
```

The e2e suite runs 13 journeys and creates real records, so run it against development or staging only. It covers:

- quote validation, the honeypot, and successful saves with a reference number
- contact, renewal and site-survey submissions
- ticket creation with an attachment; rejection of fake image files
- ticket privacy across browsers; a wrong access key is rejected
- unauthenticated admin redirects, forged cookies, and 403s on private downloads
- admin login, enquiry status changes, ticket replies and internal notes, CSV export, and the audit log
- customers see staff replies but never internal notes
- SALES role restrictions
- catalogue and settings edits showing up on the public site
- security headers

## 4. Deployment

### Option A — Docker (single VPS, e.g. in an Indian region)

```bash
cp .env.example .env    # fill in values; add POSTGRES_PASSWORD=<strong password>
docker compose up -d --build
docker compose exec web node node_modules/prisma/build/index.js migrate deploy   # (also runs on start-up)
# Seed + admin: run once from a machine with the repo, pointing DATABASE_URL at the server DB,
# or temporarily: docker compose run --rm -e ADMIN_EMAIL=… -e ADMIN_PASSWORD=… web …
```

Put a TLS-terminating reverse proxy in front. `Caddyfile.example` gets automatic Let's Encrypt certificates and passes `X-Real-IP` through. The app listens on `127.0.0.1:3000`. Uploads are kept in the `uploads` Docker volume.

### Option B — Managed platform (Vercel, Render, Railway, etc.)

- Use a managed PostgreSQL service (Neon, Supabase, RDS, Azure Database for PostgreSQL), with `sslmode=require` in `DATABASE_URL`.
- On serverless or multi-instance hosts, set `STORAGE_DRIVER=s3`. Local disk does not persist there.
- The rate limiter is in-memory, one instance at a time. With several instances, replace `src/lib/server/rate-limit.ts` with Redis or Upstash, or add rate limiting at the edge (Cloudflare or a WAF).
- Build command: `npm run build`. Start command: `npx prisma migrate deploy && npm start`.
- `APP_URL`/`NEXT_PUBLIC_SITE_URL` must be set **at build time**. They control HSTS, `upgrade-insecure-requests`, canonical URLs and the sitemap.

## 5. Domain, DNS, HTTPS, database and email setup for NTSO.in

1. **DNS** (at your registrar or DNS host, e.g. Cloudflare):
   - VPS: an `A` record `ntso.in → <server IPv4>` (and `AAAA` for IPv6), plus `www` as a `CNAME` to `ntso.in`.
   - Managed platform: add the records the platform gives you, usually an `A`/`ALIAS` record for the apex and a `CNAME` for `www`.
   - Keep the existing **MX** records for `sales@NTSO.in` mailboxes unchanged.
2. **HTTPS**: Caddy, or the platform, issues certificates automatically. After HTTPS works, the app sends HSTS (2 years, preload-ready). Only submit to the HSTS preload list once every subdomain serves HTTPS.
3. **Canonical host**: redirect `www.ntso.in` to `ntso.in` (shown in `Caddyfile.example`). `NEXT_PUBLIC_SITE_URL=https://ntso.in`.
4. **Database**: create a dedicated database and user with least privilege. Turn on automated daily backups with point-in-time recovery if the provider offers it, keep at least 30 days, store one copy off-site, and **test a restore** before launch. For self-hosting, schedule `pg_dump` (e.g. nightly cron to encrypted object storage).
5. **Email delivery**:
   - Choose an SMTP provider: Microsoft 365 SMTP AUTH, Amazon SES (Mumbai region), Brevo, Postmark, Zoho ZeptoMail, or similar.
   - Authenticate the sending domain with **SPF** (add the provider's include to the `TXT` record), **DKIM** (the CNAME or TXT keys the provider gives you) and **DMARC** (start with `_dmarc.ntso.in TXT "v=DMARC1; p=none; rua=mailto:dmarc@ntso.in"`, then tighten to `quarantine`/`reject`).
   - Set `EMAIL_FROM` to an address on the authenticated domain, e.g. `no-reply@ntso.in`. Replies to sales notifications go to the customer through Reply-To.
   - Submit a test enquiry and check that both emails arrive. The enquiry's admin page shows SENT / FAILED / NOT CONFIGURED.
6. **Bot protection (optional)**: create a Cloudflare Turnstile widget for `ntso.in` and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build time) and `TURNSTILE_SECRET_KEY`.

## 6. Security overview

- **Input**: every form is validated with Zod on the server and control characters are stripped. Output is escaped by React, emails are HTML-escaped, and JSON-LD is serialised safely. Prisma parameterises queries. The one raw query (customers) uses tagged-template parameters.
- **CSRF**: Server Actions only accept same-origin POSTs (Next.js checks Origin against Host). Cookies are `SameSite=Lax`, and `form-action 'self'` is set.
- **Abuse**: per-IP rate limits on every public form, admin login (per IP and per account) and ticket lookup. A honeypot field and a minimum fill time block simple bots; Turnstile is optional.
- **Uploads**: at most 3 files of 5 MB each. The file type is checked from its bytes (PNG/JPG/WebP/PDF), not its extension, and files get random names. Ticket attachments are only available to staff with ticket permission, are served as downloads with `nosniff` and a sandboxed CSP, and every download is audit-logged.
- **Customer ticket access**: needs the reference, the email and the access key. The key is a 144-bit random value stored only as a SHA-256 hash and compared in constant time. The httpOnly access cookie is checked again on every request. Internal notes never leave the server for customers.
- **Admin**: bcrypt hashes, sessions stored as hashes with sliding expiry, all sessions revoked on password change or deactivation, and least-privilege roles (ADMIN / SALES / SUPPORT / CONTENT) enforced in every page, server action and route handler. An audit log records logins, failed logins, status changes, edits, exports and downloads.
- **Headers**: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS (over https), `noindex`/`no-store` on `/admin`, and no `X-Powered-By`.
- **Secrets**: only from environment variables. `.env` is gitignored, and no secret is ever sent to the client.
- **Hardening options**: nonce-based CSP to remove `'unsafe-inline'`, MFA for admins (e.g. TOTP), Redis-backed rate limits, a WAF (Cloudflare), and malware scanning for uploads.

Known dependency advisories (`npm audit`): they affect build-time tooling only (PostCSS inside Next.js's CSS pipeline, `deepmerge-ts` inside the Prisma CLI) and do not process untrusted input at runtime. Re-check before launch and upgrade when patched versions are available.

## 7. Content governance (business rules)

The site deliberately does **not** show prices, discounts, stock levels, partner or reseller status, reviews, client logos, certifications, registration details or SLA commitments.

- All 55 catalogue entries are **sample listings** (`isSample = true`). The admin dashboard shows a reminder until they are reviewed. Vendor plan names, especially Microsoft, change often; verify them against current vendor offers for India before launch.
- Brand names appear only as "we can help source, subject to availability". The footer and `/vendors` include a trademark disclaimer. Add official partner badges only after authorisation is confirmed.
- Phone number, address and map, GSTIN, CIN, business hours and social links are all **empty by default**, and the site hides them until an admin enters verified values in **Website settings**.
- Policy pages are clearly marked **drafts** for legal review.
- Services delivered by external partners (MDR, incident response, vulnerability assessment) are labelled as such.

## 8. Environment variables

See `.env.example` for the complete list, with placeholders only.

## 9. Launch checklist

See [`docs/launch-checklist.md`](docs/launch-checklist.md).
