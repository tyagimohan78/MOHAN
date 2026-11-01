/*! NTSO Chat Assistant - DRAFT for review. Self-contained, no dependencies. */
(function () {
  "use strict";
  if (window.__ntsoChatLoaded) return; window.__ntsoChatLoaded = true;

  // ===== CONFIGURATION =====
  // PLACEHOLDER: set to a real HTTPS endpoint that accepts JSON POST leads.
  // Left empty by default -> falls back to a prefilled mailto: to SALES_EMAIL.
  var LEAD_ENDPOINT = "";
  var SALES_EMAIL = "sales@ntso.in";
  var SITE = "https://ntso.in";
  var BRAND = "NTSO Assistant";

  var LINKS = {
    quote: SITE + "/request-quote",
    renewal: SITE + "/license-renewal",
    surveyNet: SITE + "/it-services/network-infrastructure#site-survey",
    surveyCctv: SITE + "/it-services/cctv-surveillance#site-survey",
    ticket: SITE + "/support/new-ticket",
    ticketStatus: SITE + "/support/ticket-status",
    amc: SITE + "/it-services/amc-plans",
    contact: SITE + "/contact",
    faqs: SITE + "/faqs"
  };

  var FAQ = [
    { k: ["price", "cost", "rate", "pricing", "how much", "quotation", "quote"],
      a: "We don't publish prices \u2014 pricing depends on configuration, quantity, license programme and current vendor pricing. We share a written quotation after confirming your requirement. I can take your details now, or you can use the <a href='" + LINKS.quote + "' target='_blank'>Request a Quote form</a>." },
    { k: ["microsoft 365", "m365", "office 365", "office", "windows", "server license", "sophos", "licens", "renew", "subscription"],
      a: "We help with Microsoft 365, Windows, Windows Server, Sophos and other business software \u2014 procurement, renewals and license guidance. For a renewal, share the product, number of users/devices and current expiry date via the <a href='" + LINKS.renewal + "' target='_blank'>License Renewal enquiry</a>. Please don't send license keys or admin passwords." },
    { k: ["which plan", "business basic", "business standard", "business premium", "e3", "e5"],
      a: "It depends on whether you need desktop Office apps, business email, device management and advanced security. Business Basic/Standard/Premium suit most SMEs; enterprise plans suit larger or regulated organisations. Our team will recommend options based on your users." },
    { k: ["security", "cyber", "firewall", "endpoint", "antivirus", "mfa", "email security"],
      a: "Our cybersecurity services cover endpoint protection, firewalls, email security, MFA and Microsoft security configuration for business environments." },
    { k: ["laptop", "desktop", "workstation", "printer", "scanner", "hardware", "display", "monitor", "accessor", "device"],
      a: "We source laptops, desktops, workstations, servers & storage, printers, displays and accessories to your specification. Availability and pricing are confirmed at quotation." },
    { k: ["network", "lan", "wan", "wifi", "wi-fi", "cabling", "rack", "switch", "vlan", "server room"],
      a: "We do LAN/WAN design, enterprise Wi-Fi, structured cabling, racks and server-room organisation. We can survey your site first \u2014 scope, schedule and any applicable charges are agreed before visiting. <a href='" + LINKS.surveyNet + "' target='_blank'>Request a network site survey</a>." },
    { k: ["cctv", "camera", "surveillance", "nvr", "dvr"],
      a: "We handle IP and analog CCTV, NVR/DVR configuration, storage planning and maintenance for offices, factories and warehouses. <a href='" + LINKS.surveyCctv + "' target='_blank'>Request a CCTV site survey</a>." },
    { k: ["cloud", "azure", "migration", "backup", "identity"],
      a: "We work with Microsoft Azure and Microsoft 365 \u2014 identity, migration, backup, security configuration and ongoing management." },
    { k: ["amc", "annual maintenance", "maintenance contract", "managed"],
      a: "An IT AMC covers scheduled preventive maintenance and support for your IT equipment for a year. Scope (assets covered, visits, whether parts are included) is agreed in writing after an assessment. <a href='" + LINKS.amc + "' target='_blank'>See AMC options</a>." },
    { k: ["on-site", "onsite", "visit", "remote"],
      a: "We offer remote and on-site support options. On-site availability depends on your location and the support arrangement agreed with you." },
    { k: ["ticket", "support", "issue", "problem", "not working", "help desk", "helpdesk"],
      a: "For technical issues, please <a href='" + LINKS.ticket + "' target='_blank'>raise a ticket in the Support Center</a>. You can also <a href='" + LINKS.ticketStatus + "' target='_blank'>check ticket status</a>." },
    { k: ["partner", "authorised", "authorized", "reseller"],
      a: "Brands are listed to show the categories we can help source. Partner/reseller status for a specific vendor is stated only where verified, and availability is confirmed at quotation." },
    { k: ["procure", "bulk", "consolidat", "together", "installation"],
      a: "Yes \u2014 we can prepare a consolidated quotation covering hardware, licensing and services such as installation, configuration and cabling, with a single point of contact." },
    { k: ["ai", "automation", "barcode", "warehouse", "plant"],
      a: "We can also discuss AI automation, barcode systems and plant/warehouse services. Share your requirement and our sales team will get back to you." },
    { k: ["contact", "email", "phone", "call", "sales", "mohan"],
      a: "You can reach our sales team at <a href='mailto:" + SALES_EMAIL + "'>" + SALES_EMAIL + "</a>, or leave your details here and we'll get in touch." },
    { k: ["where", "location", "india", "city", "area"],
      a: "We serve organisations across India. For on-site work, availability depends on location \u2014 share your city and requirement and our team will confirm." }
  ];

  // ===== STYLES =====
  var css = "\
#ntso-chat-btn{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;background:#0b4ea2;color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(11,78,162,.35);z-index:2147483000;display:flex;align-items:center;justify-content:center;transition:transform .2s}\
#ntso-chat-btn:hover{transform:scale(1.06)}#ntso-chat-btn svg{width:28px;height:28px}\
#ntso-chat-win{position:fixed;right:20px;bottom:92px;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 110px);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(15,23,42,.22);z-index:2147483000;display:none;flex-direction:column;overflow:hidden;font:14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b}\
#ntso-chat-win.open{display:flex}\
.ntso-h{background:linear-gradient(135deg,#0b4ea2,#1d6fd8);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}\
.ntso-h .av{width:34px;height:34px;border-radius:50%;background:#fff;color:#0b4ea2;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:12px}\
.ntso-h .t{flex:1}.ntso-h .t b{display:block;font-size:15px}.ntso-h .t span{font-size:12px;opacity:.85}\
.ntso-h button{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1}\
.ntso-body{flex:1;overflow-y:auto;padding:14px;background:#f5f7fb}\
.ntso-m{max-width:85%;padding:9px 12px;border-radius:12px;margin:6px 0;word-wrap:break-word}\
.ntso-m.bot{background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px}\
.ntso-m.user{background:#0b4ea2;color:#fff;margin-left:auto;border-bottom-right-radius:4px}\
.ntso-m a{color:#0b4ea2;font-weight:600}.ntso-m.user a{color:#fff}\
.ntso-q{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}\
.ntso-q button{background:#fff;border:1px solid #0b4ea2;color:#0b4ea2;border-radius:16px;padding:6px 11px;font-size:13px;cursor:pointer}\
.ntso-q button:hover{background:#0b4ea2;color:#fff}\
.ntso-in{display:flex;border-top:1px solid #e2e8f0;padding:8px;gap:6px;background:#fff}\
.ntso-in input{flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:9px 10px;font-size:14px;outline:none}\
.ntso-in input:focus{border-color:#0b4ea2}\
.ntso-in button{background:#0b4ea2;color:#fff;border:none;border-radius:8px;padding:0 14px;cursor:pointer;font-weight:600}\
.ntso-f{font-size:11px;color:#64748b;text-align:center;padding:4px 8px 8px;background:#fff}\
@media (max-width:480px){#ntso-chat-win{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0}#ntso-chat-btn{right:14px;bottom:14px}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ===== DOM =====
  var btn = document.createElement("button");
  btn.id = "ntso-chat-btn"; btn.setAttribute("aria-label", "Chat with NTSO");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>';
  var win = document.createElement("div");
  win.id = "ntso-chat-win"; win.setAttribute("role", "dialog"); win.setAttribute("aria-label", BRAND);
  win.innerHTML = '<div class="ntso-h"><div class="av">NTSO</div><div class="t"><b>' + BRAND + '</b><span>IT solutions, licensing &amp; support</span></div><button aria-label="Close">&times;</button></div>' +
    '<div class="ntso-body"></div><form class="ntso-in"><input type="text" placeholder="Type your question\u2026" aria-label="Message"><button type="submit">Send</button></form>' +
    '<div class="ntso-f">Automated assistant \u00b7 Prices shared only by written quotation</div>';
  function mount() { document.body.appendChild(btn); document.body.appendChild(win); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  var body = win.querySelector(".ntso-body"), form = win.querySelector("form"), input = form.querySelector("input");
  var started = false, lead = null, step = -1;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function msg(html, who) { var d = document.createElement("div"); d.className = "ntso-m " + (who || "bot"); d.innerHTML = html; body.appendChild(d); body.scrollTop = body.scrollHeight; }
  function quick(opts) {
    var w = document.createElement("div"); w.className = "ntso-q";
    opts.forEach(function (o) { var b = document.createElement("button"); b.type = "button"; b.textContent = o[0];
      b.onclick = function () { w.remove(); msg(esc(o[0]), "user"); o[1](); }; w.appendChild(b); });
    body.appendChild(w); body.scrollTop = body.scrollHeight;
  }
  var MAIN = [
    ["Get a quote", function () { topic = "Quotation"; msg("Happy to help with a quotation. We don't publish prices \u2014 we confirm your requirement and send a written quote. You can use the <a href='" + LINKS.quote + "' target='_blank'>Request a Quote form</a>, or share details here."); startLead("Quotation"); }],
    ["License renewal", function () { msg("We assist with Microsoft 365, Windows, Server, Sophos and other renewals. Useful details: product, number of users/devices and current expiry date. Please <b>don't</b> share license keys or admin passwords. Full form: <a href='" + LINKS.renewal + "' target='_blank'>License Renewal enquiry</a>."); startLead("License renewal"); }],
    ["Networking/CCTV site survey", function () { msg("We can survey your site before recommending a network or CCTV solution. Scope, schedule and any applicable charges are agreed with you before the visit. Forms: <a href='" + LINKS.surveyNet + "' target='_blank'>Network survey</a> \u00b7 <a href='" + LINKS.surveyCctv + "' target='_blank'>CCTV survey</a>."); startLead("Site survey (Networking/CCTV)"); }],
    ["IT support", function () { msg("For a technical issue, the fastest route is the Support Center: <a href='" + LINKS.ticket + "' target='_blank'>Raise a ticket</a> \u00b7 <a href='" + LINKS.ticketStatus + "' target='_blank'>Ticket status</a>. Interested in ongoing support? Ask me about AMC plans."); afterAnswer(); }],
    ["Talk to sales", function () { msg("Our sales team is at <a href='mailto:" + SALES_EMAIL + "'>" + SALES_EMAIL + "</a>. Leave your details and they'll get back to you."); startLead("Sales enquiry"); }]
  ];
  var topic = "";
  function menu() { quick(MAIN); }
  function afterAnswer() { quick([["Leave my details", function () { startLead(topic || "General enquiry"); }], ["Main menu", function () { msg("What can I help you with?"); menu(); }]]); }

  // ===== LEAD CAPTURE =====
  var STEPS = [
    { f: "name", q: "May I have your name?", req: true },
    { f: "company", q: "Which company are you with? (type <i>skip</i> if not applicable)" },
    { f: "contact", q: "Your phone number or email so our team can reach you?", req: true, v: function (s) { return /@.+\./.test(s) || /\d{8,}/.test(s.replace(/[\s\-+()]/g, "")); }, err: "Please enter a valid email or phone number." },
    { f: "requirement", q: "Briefly describe your requirement (products, quantity, users/devices, location, timeline).", req: true }
  ];
  function startLead(t) { lead = { topic: t }; step = 0; msg(STEPS[0].q); input.focus(); }
  function leadInput(text) {
    var s = STEPS[step];
    if (!s.req && /^skip$/i.test(text)) text = "";
    if (s.req && !text) { msg("This field is required."); return; }
    if (s.v && !s.v(text)) { msg(s.err); return; }
    lead[s.f] = text; step++;
    if (step < STEPS.length) { msg(STEPS[step].q); return; }
    step = -1;
    msg("Thanks! Here's what I have:<br><b>Topic:</b> " + esc(lead.topic) + "<br><b>Name:</b> " + esc(lead.name) + "<br><b>Company:</b> " + esc(lead.company || "-") + "<br><b>Contact:</b> " + esc(lead.contact) + "<br><b>Requirement:</b> " + esc(lead.requirement));
    quick([["Submit", submitLead], ["Start over", function () { startLead(lead.topic); }], ["Cancel", function () { lead = null; msg("No problem. Anything else?"); menu(); }]]);
  }
  function mailto() {
    var subj = "Website enquiry: " + lead.topic + " \u2014 " + lead.name;
    var b = "Topic: " + lead.topic + "\nName: " + lead.name + "\nCompany: " + (lead.company || "-") + "\nContact: " + lead.contact + "\nRequirement: " + lead.requirement + "\nPage: " + location.href;
    return "mailto:" + SALES_EMAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(b);
  }
  function mailFallback() {
    var href = mailto();
    msg("Opening your email app with these details addressed to " + SALES_EMAIL + ". Please press send there. If nothing opens, <a href='" + href + "'>click here</a> or email us directly.");
    try { window.location.href = href; } catch (e) {}
    done();
  }
  function done() { msg("Our team will review and respond. We'll confirm pricing and scope in a written quotation \u2014 nothing is committed through this chat."); menu(); }
  function submitLead() {
    var payload = Object.assign({ page: location.href, ts: new Date().toISOString() }, lead);
    if (!LEAD_ENDPOINT) { mailFallback(); return; }
    msg("Submitting\u2026");
    fetch(LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); msg("Your details have been received \u2714"); done(); })
      .catch(function () { msg("Couldn't submit online."); mailFallback(); });
  }

  // ===== FAQ MATCH =====
  function answer(text) {
    var t = " " + text.toLowerCase() + " ", best = null, score = 0;
    FAQ.forEach(function (f, i) { var s = 0; f.k.forEach(function (k) { if (k === "ai" ? /\bai\b/.test(t) : t.indexOf(k) > -1) s += k.length; }); if (s > score) { score = s; best = f; } });
    if (/^\s*(hi|hello|hey|namaste)\b/.test(t.trim()) && !best) { msg("Hello! How can I help today?"); menu(); return; }
    if (best) { msg(best.a); afterAnswer(); }
    else { msg("I'm not sure about that one, and I don't want to guess. Our team can answer it directly \u2014 leave your details, or email <a href='mailto:" + SALES_EMAIL + "'>" + SALES_EMAIL + "</a>."); afterAnswer(); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); var text = input.value.trim(); input.value = "";
    if (!text && step < 0) return;
    msg(esc(text || "(blank)"), "user");
    if (step >= 0) leadInput(text); else { topic = "General enquiry"; answer(text); }
  });
  function toggle(open) {
    win.classList.toggle("open", open);
    if (open && !started) { started = true;
      msg("Hi! Welcome to <b>NTSO Private Limited</b>. We help businesses with software licensing &amp; renewals, IT hardware, networking, cloud, cybersecurity, CCTV and IT support.");
      msg("What can I help you with today?"); menu(); }
    if (open) input.focus();
  }
  btn.addEventListener("click", function () { toggle(!win.classList.contains("open")); });
  win.querySelector(".ntso-h button").addEventListener("click", function () { toggle(false); });
  window.NTSOChat = { open: function () { toggle(true); }, close: function () { toggle(false); } };
})();
