/* Automated accessibility (axe-core, WCAG 2.1 A/AA) and responsive-layout audit.
   Usage: BASE_URL=http://localhost:3000 node tests/e2e/a11y.mjs
   Fails on any serious/critical violation or any horizontal overflow at phone/tablet/desktop widths. */
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const pages = [
  "/", "/about", "/products", "/products/business-laptops", "/products/business-laptops/14-inch-business-laptop",
  "/software-licensing", "/software-licensing/microsoft-365-business-premium", "/license-renewal", "/it-services",
  "/it-services/network-infrastructure", "/it-services/cctv-surveillance", "/it-services/amc-plans", "/it-services/it-procurement",
  "/cloud-solutions", "/cybersecurity", "/industries", "/support", "/support/new-ticket", "/support/ticket-status",
  "/contact", "/request-quote", "/vendors", "/faqs", "/privacy-policy", "/careers", "/admin/login", "/does-not-exist",
];
const widths = [390, 768, 1280];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const problems = [];
    if (overflow > 1) problems.push(`horizontal overflow ${overflow}px`);
    if (w === 1280 || w === 390) {
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () =>
        (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map((v) => ({
          id: v.id, impact: v.impact, nodes: v.nodes.length, target: v.nodes[0]?.target?.join(" "), summary: v.nodes[0]?.failureSummary?.split("\n")[1],
        })),
      );
      for (const v of res) if (v.impact === "serious" || v.impact === "critical") problems.push(`${v.impact} ${v.id} ×${v.nodes} e.g. ${v.target} — ${v.summary}`);
    }
    if (problems.length) {
      failures += problems.length;
      console.log(`✘ ${w}px ${path}\n   ${problems.join("\n   ")}`);
    }
  }
  await page.close();
  console.log(`checked ${pages.length} pages at ${w}px`);
}
// Admin screens (optional): set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to include them.
if (process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", process.env.E2E_ADMIN_EMAIL);
  await page.fill("#password", process.env.E2E_ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`);
  const firstEnquiry = await page.getAttribute("a[href^='/admin/enquiries/']", "href").catch(() => null);
  await page.goto(`${BASE}/admin/tickets?status=all`);
  const firstTicket = await page.getAttribute("td a[href^='/admin/tickets/']", "href").catch(() => null);
  const adminPages = ["/admin", "/admin/enquiries", "/admin/tickets", "/admin/customers", "/admin/products", "/admin/products/new", "/admin/categories?edit=new",
    "/admin/services", "/admin/faqs?edit=new", "/admin/settings", "/admin/users?edit=new", "/admin/audit-log", "/admin/account", firstEnquiry, firstTicket].filter(Boolean);
  for (const path of adminPages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () =>
      (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.impact} ${v.id} ×${v.nodes.length} e.g. ${v.nodes[0]?.target?.join(" ")} — ${v.nodes[0]?.failureSummary?.split("\n")[1]}`),
    );
    if (res.length) {
      failures += res.length;
      console.log(`✘ admin ${path}\n   ${res.join("\n   ")}`);
    }
  }
  console.log(`checked ${adminPages.length} admin pages`);
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} accessibility/layout problem(s)` : "\nNo serious/critical accessibility violations; no horizontal overflow.");
process.exit(failures ? 1 : 0);
