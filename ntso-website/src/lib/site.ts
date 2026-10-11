// Company facts. Only verified information belongs here — see README "Content governance".
export const site = {
  name: "NTSO Private Limited",
  shortName: "NTSO",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://ntso.in").replace(/\/$/, ""),
  displayDomain: "NTSO.in",
  salesEmail: "sales@NTSO.in",
  businessContact: "Mohan Tyagi",
  market: "India",
  tagline: "Enterprise IT solutions, licensing & support",
  description:
    "NTSO Private Limited helps Indian businesses with software licensing, IT hardware procurement, networking, cloud, cybersecurity, CCTV and technical support. Request a quote from our team.",
} as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavItem = NavLink & { children?: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "All hardware categories", href: "/products", description: "Laptops, servers, networking, printers and more" },
      { label: "Computing devices", href: "/products#computing-devices", description: "Laptops, desktops, workstations, thin clients" },
      { label: "Networking products", href: "/products#networking-products", description: "Switches, routers, Wi-Fi, racks and cabling" },
      { label: "Servers & storage", href: "/products#servers-and-storage", description: "Rack and tower servers, NAS, drives" },
      { label: "Security & surveillance", href: "/products#security-and-surveillance", description: "CCTV, NVR/DVR, firewall appliances" },
      { label: "Printing & office", href: "/products#printing-and-office-equipment", description: "Printers, scanners, UPS, displays" },
      { label: "Vendors & categories", href: "/vendors", description: "Brands we can source, subject to availability" },
    ],
  },
  {
    label: "Software & Licensing",
    href: "/software-licensing",
    children: [
      { label: "All software & licensing", href: "/software-licensing" },
      { label: "Microsoft 365 & Microsoft software", href: "/software-licensing#microsoft" },
      { label: "Sophos security", href: "/software-licensing#sophos" },
      { label: "Other enterprise software", href: "/software-licensing#other-software" },
      { label: "License renewal", href: "/license-renewal", description: "Renew or true-up existing subscriptions" },
    ],
  },
  {
    label: "IT Services",
    href: "/it-services",
    children: [
      { label: "All IT services", href: "/it-services" },
      { label: "Networking & infrastructure", href: "/it-services/network-infrastructure", description: "LAN/WAN, Wi-Fi, structured cabling, racks" },
      { label: "CCTV & surveillance", href: "/it-services/cctv-surveillance", description: "IP/analog CCTV, NVR, site surveys" },
      { label: "IT AMC plans", href: "/it-services/amc-plans", description: "Preventive maintenance and managed support" },
      { label: "Enterprise IT procurement", href: "/it-services/it-procurement", description: "One point of contact for IT purchasing" },
    ],
  },
  { label: "Cloud Solutions", href: "/cloud-solutions" },
  { label: "Cybersecurity", href: "/cybersecurity" },
  { label: "Industries", href: "/industries" },
  {
    label: "Support Center",
    href: "/support",
    children: [
      { label: "Support Center", href: "/support" },
      { label: "Raise a support ticket", href: "/support/new-ticket" },
      { label: "Check ticket status", href: "/support/ticket-status" },
      { label: "Warranty & RMA", href: "/warranty-rma" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Solutions",
    links: [
      { label: "Software & Licensing", href: "/software-licensing" },
      { label: "IT Hardware", href: "/products" },
      { label: "Networking & Infrastructure", href: "/it-services/network-infrastructure" },
      { label: "Cloud Solutions", href: "/cloud-solutions" },
      { label: "Cybersecurity", href: "/cybersecurity" },
      { label: "CCTV & Surveillance", href: "/it-services/cctv-surveillance" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Support Center", href: "/support" },
      { label: "Raise a ticket", href: "/support/new-ticket" },
      { label: "Ticket status", href: "/support/ticket-status" },
      { label: "IT AMC Plans", href: "/it-services/amc-plans" },
      { label: "License Renewal", href: "/license-renewal" },
      { label: "Warranty & RMA", href: "/warranty-rma" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Industries", href: "/industries" },
      { label: "Vendors & Categories", href: "/vendors" },
      { label: "FAQs", href: "/faqs" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Shipping & Delivery", href: "/shipping-policy" },
      { label: "Returns & Refunds", href: "/returns-policy" },
    ],
  },
];

// Options shared by forms and admin filters.
export const quoteCategories = [
  "Software Licensing",
  "Microsoft 365 / Microsoft Software",
  "Sophos / Endpoint Security",
  "IT Hardware & Devices",
  "Servers & Storage",
  "Networking Equipment",
  "Networking & Structured Cabling Services",
  "Cloud Solutions (Azure / Microsoft 365)",
  "Cybersecurity Services",
  "CCTV & Surveillance",
  "IT AMC & Managed Support",
  "Enterprise IT Procurement",
  "Other",
] as const;

export const licenseDurations = ["Not applicable", "Monthly", "1 year", "2 years", "3 years", "Perpetual", "Not sure"] as const;
export const contactMethods = ["Email", "Phone call", "WhatsApp", "Any"] as const;

export const ticketCategories = [
  "Desktop / Laptop",
  "Windows / Operating System",
  "Microsoft 365 / Email",
  "Printer / Scanner",
  "Network / Wi-Fi",
  "Server",
  "Endpoint Security / Antivirus",
  "Backup",
  "CCTV / Surveillance",
  "Software Installation",
  "User Onboarding / Offboarding",
  "Other",
] as const;
