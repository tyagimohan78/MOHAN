# Deploying NTSO.in on Render — step by step

This guide puts the website live at **https://ntso.in**. The pieces are:

- **Render** (Singapore region) hosts the website, the database, the upload disk and a daily maintenance job.
- **Zoho Mail** (free plan) hosts the `sales@NTSO.in` mailbox.
- **Brevo** (free plan) sends the website's automatic emails: enquiry notifications, customer confirmations and ticket updates.
- **Your domain registrar** (GoDaddy, Hostinger or BigRock) keeps managing DNS for `ntso.in`.

Allow 1–2 hours, plus waiting time for DNS (usually minutes, sometimes a few hours).

> Dashboards change over time. Wherever a provider shows you an exact value (DNS records, SMTP host, IP address), **use the value it shows** rather than an example in this guide.

### What it costs (approximate, billed by Render in USD)

| Item | Plan in `render.yaml` | Approx. per month |
|---|---|---|
| Website | Starter web service | $7 |
| Database | PostgreSQL basic-256mb | $6 |
| Upload disk | 1 GB | $0.25 |
| Daily maintenance job | Starter cron job (runs about 1 minute a day) | under $1 |
| Zoho Mail (up to 5 users) and Brevo (300 emails/day) | Free plans | $0 |

Check current prices on each provider's pricing page before you sign up.

---

## Step 1 — Create the `sales@NTSO.in` mailbox (Zoho Mail)

1. Go to **zoho.com/mail** → *Pricing* → choose the **Forever Free** plan (sign up from the India site so your account is in Zoho's India data centre).
2. Choose **"Sign up with a domain I already own"** and enter `ntso.in`.
3. **Verify the domain.** Zoho shows a **TXT** record (or CNAME). Add it in your registrar's DNS settings:
   - **GoDaddy:** *My Products → ntso.in → DNS → Add New Record*
   - **Hostinger:** *Domains → ntso.in → DNS / Nameservers*
   - **BigRock:** *Manage Domain → DNS Management*

   Then click *Verify* in Zoho.
4. Create the user **sales@ntso.in** (and others if you like, e.g. `mohan@ntso.in`).
5. Add Zoho's **MX records** exactly as Zoho shows them (for the India data centre they are usually `mx.zoho.in`, `mx2.zoho.in`, `mx3.zoho.in` with priorities 10/20/50). **Delete any old MX records** for `ntso.in`.
6. Leave Zoho's SPF and DKIM pages open — you will combine SPF with Brevo in Step 2.

Check: from your personal email, send a message to `sales@ntso.in` and confirm it arrives in Zoho.

## Step 2 — Website email sending (Brevo)

1. Sign up at **brevo.com** (free plan).
2. **Senders, Domains & Dedicated IPs → Domains → Add a domain** → `ntso.in`. Brevo shows DNS records (a `brevo-code` TXT and DKIM records). Add them at your registrar and click *Authenticate*.
3. **One SPF record only.** A domain must have a single SPF TXT record on `@`. Combine Zoho and Brevo like this (use the includes they show you):
   ```
   Type: TXT   Name: @   Value: v=spf1 include:zoho.in include:spf.brevo.com ~all
   ```
4. Add Zoho's **DKIM** record too (Zoho Mail admin → *Domains → ntso.in → Email Configuration → DKIM*).
5. Add a **DMARC** record (start in monitoring mode):
   ```
   Type: TXT   Name: _dmarc   Value: v=DMARC1; p=none; rua=mailto:sales@ntso.in
   ```
6. Add a sender: **Senders → Add sender** → name `NTSO Private Limited`, email `no-reply@ntso.in`.
7. **SMTP & API → SMTP** → generate an **SMTP key**. Note these values for Step 3:
   - SMTP server (usually `smtp-relay.brevo.com`), port `587`
   - Login (looks like an email address or an ID shown by Brevo)
   - SMTP key (this is the password — keep it secret)

## Step 3 — Create everything on Render (one click with the Blueprint)

1. Sign up at **render.com** with your **GitHub** account and allow Render to access the `tyagimohan78/MOHAN` repository. Add a payment card (*Billing*).
2. Click **New + → Blueprint**, select the **MOHAN** repository and branch **main**. Render reads `render.yaml` and lists what it will create:
   - **ntso-db**: PostgreSQL 16, Singapore
   - **ntso-website**: Docker web service with a 1 GB disk at `/data/uploads`
   - **ntso-maintenance**: daily cron job at 03:00 IST
3. Fill in the values Render asks for:

   | Variable | Value |
   |---|---|
   | `SMTP_HOST` | from Brevo, e.g. `smtp-relay.brevo.com` |
   | `SMTP_USER` | your Brevo SMTP login |
   | `SMTP_PASSWORD` | your Brevo SMTP key |
   | `CLIENT_IP_HEADER` | leave empty for now (see Step 6) |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | leave empty (optional bot protection; can be added later) |

4. Click **Apply**. The first build takes about 5–10 minutes. Each start of the website automatically applies database migrations.
5. When the service shows **Live**, open `https://ntso-website.onrender.com/api/health` (Render shows the exact `.onrender.com` address). You should see:
   ```json
   {"status":"ok","database":"ok","storage":"ok", ...}
   ```

## Step 4 — Load the catalogue and create your admin login

**Automatic (no shell needed):** the Blueprint sets `SEED_ON_START=true`, and asks for `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`. On start, the website loads the catalogue (safe to repeat, never duplicates or overwrites edits). It creates that first admin **only if no admin exists yet**, so later restarts never reset the password. After your first login, change the password in **My account** and you may delete `INITIAL_ADMIN_PASSWORD` from Render's environment.

**Manual alternative:** in Render, open **ntso-website → Shell** (top of the service page). Run:

```sh
node ops/seed.js
```
This loads categories, the sample products and licences, services and FAQs. It is safe to run again and never overwrites your edits.

Then create your admin account (use your own email and a strong password):

```sh
ADMIN_EMAIL='mohan@ntso.in' ADMIN_PASSWORD='Choose-A-Long-Strong-Passw0rd' ADMIN_NAME='Mohan Tyagi' node ops/create-admin.js
```

Log in at `https://ntso-website.onrender.com/admin`. Then go to **My account → Change password**, so the password you typed into the shell is no longer in use. Create accounts for staff in **Admin users**, giving each person only the role they need: SALES, SUPPORT or CONTENT.

## Step 5 — Connect the domain ntso.in

1. In Render: **ntso-website → Settings → Custom Domains → Add** `ntso.in`. Add `www.ntso.in` as well if Render doesn't add it automatically.
2. Render shows the DNS records to create. Typically:
   - an **A** record for `@` (the root domain), pointing to the IP address Render shows
   - a **CNAME** record for `www`, pointing to your `ntso-website.onrender.com` address
3. At your registrar:
   - **Remove** any existing `A` record for `@` (often a "parked" or "website builder" record) and any conflicting `www` record.
   - **Add** the records Render showed.
   - Do **not** touch the MX, SPF, DKIM or DMARC records from Steps 1–2.
4. Back in Render, click **Verify**. Once DNS has propagated, Render issues the HTTPS certificate automatically. Then open **https://ntso.in**.

## Step 6 — Check everything after go-live

Log in at **https://ntso.in/admin** and go to **Website settings**:

1. **Deployment diagnostics → "Your IP as detected by the website".** Compare it with your real IP (search "what is my IP").
   - If they match, nothing to do.
   - If it shows a different address, look at **"Proxy headers received"** for the header that holds your real IP (for example `cf-connecting-ip` or `true-client-ip`). In Render, set **`CLIENT_IP_HEADER`** to that header name (*Environment → Save*, which redeploys) and check again. This makes rate limits apply per visitor.
2. **Upload storage** should say **Writable**.
3. Click **Send test email to me**. Confirm it arrives (check spam the first time).
4. Fill in the verified business details: business hours, phone or WhatsApp, address (and map link), GSTIN, CIN, and social profile links. Anything left empty stays hidden on the site.

Then test as a customer, from a phone if possible:

- Submit a quote at `https://ntso.in/request-quote`. You should get a reference number, `sales@ntso.in` should receive the notification, and the customer address should receive a confirmation. The quote should appear in **Admin → Enquiries**.
- Raise a ticket at `/support/new-ticket` with a screenshot attached. Reply to it from **Admin → Tickets**, then view it at `/support/ticket-status`.
- Mark your test enquiries and tickets as **Closed** afterwards.

Finally:

- Work through [`launch-checklist.md`](launch-checklist.md): review the 55 sample listings, legal review of the policy pages, and any remaining DNS checks.
- Add the site to **Google Search Console** (verify with a DNS TXT record) and submit `https://ntso.in/sitemap.xml`.
- Set up an uptime monitor on `https://ntso.in/api/health` (e.g. UptimeRobot, free).

## Day-to-day operation

- **Updates:** every merge to `main` that changes `ntso-website/` redeploys automatically. If a build fails, the previous version keeps running.
- **Backups:** check the backup and recovery options for your Render PostgreSQL plan (*ntso-db → Recovery*). Also take an occasional manual export. For a copy you control, run `pg_dump` with the database's *External Connection String* (you can temporarily allow your IP in *ntso-db → Access Control*).
- **Logs:** go to *ntso-website → Logs*. Errors are logged as JSON lines, for example `email.send_failed` or `enquiry.save_failed`.
- **Failed emails:** enquiries whose notification failed are flagged "Email failed" in the admin list. Fix the SMTP settings, then click **Resend email** on the enquiry.
- **Maintenance:** the `ntso-maintenance` cron job runs daily. It removes expired sessions and rate-limit counters, and deletes audit-log entries older than 365 days.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails on Render | Open the build log. The most common cause is a typo in an environment variable; the previous version stays live. |
| `/api/health` shows `"database":"unavailable"` | Check that `DATABASE_URL` comes from `ntso-db` (Blueprint sets this) and the database is *Available*. |
| `"storage":"error"` | Confirm the disk is attached at `/data/uploads` (*ntso-website → Disks*). |
| Test email fails | Re-check the `SMTP_*` values (the password is the Brevo **SMTP key**, not your Brevo login password) and that the `ntso.in` domain is authenticated in Brevo. |
| Emails land in spam | Make sure SPF (one record), DKIM (Zoho and Brevo) and DMARC exist. Use a mail-tester service to check. |
| Domain not verifying | DNS can take time. Make sure the old `A` record for `@` is deleted and there is only one record for `www`. |
