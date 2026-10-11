// Static marketing content. Claims here must remain substantiable — see README "Content governance".

export const coreCategories = [
  { icon: "key", title: "Software Licensing", text: "Microsoft 365, Windows, Server, Sophos and other business software — procurement, renewals and license guidance.", href: "/software-licensing", cta: "Explore licensing" },
  { icon: "shield-check", title: "Cybersecurity Solutions", text: "Endpoint protection, firewalls, email security, MFA and Microsoft security configuration for business environments.", href: "/cybersecurity", cta: "View security services" },
  { icon: "laptop", title: "IT Hardware & Devices", text: "Laptops, desktops, workstations, printers, displays and accessories sourced to your specification.", href: "/products", cta: "Browse hardware" },
  { icon: "network", title: "Networking & Infrastructure", text: "LAN/WAN design, enterprise Wi-Fi, structured cabling, racks and server room organisation.", href: "/it-services/network-infrastructure", cta: "Plan your network" },
  { icon: "cloud", title: "Cloud Solutions", text: "Microsoft Azure and Microsoft 365 — identity, migration, backup, security configuration and ongoing management.", href: "/cloud-solutions", cta: "Explore cloud" },
  { icon: "cctv", title: "CCTV & Surveillance", text: "IP and analog CCTV, NVR/DVR configuration, storage planning and maintenance for offices, factories and warehouses.", href: "/it-services/cctv-surveillance", cta: "Request a survey" },
  { icon: "wrench", title: "IT AMC & Managed Support", text: "Preventive maintenance, remote and on-site support options under an agreed annual maintenance contract.", href: "/it-services/amc-plans", cta: "See AMC options" },
  { icon: "procurement", title: "Enterprise IT Procurement", text: "One point of contact for hardware, software and services, with consolidated quotations and renewal tracking.", href: "/it-services/it-procurement", cta: "Simplify procurement" },
];

export const featuredProductCategories = [
  { icon: "laptop", title: "Business Laptops", href: "/products/business-laptops" },
  { icon: "monitor", title: "Desktops & Workstations", href: "/products/desktop-computers" },
  { icon: "server", title: "Servers & Storage", href: "/products/rack-servers" },
  { icon: "printer", title: "Printers & Scanners", href: "/products/multifunction-printers" },
  { icon: "network", title: "Networking Equipment", href: "/products/network-switches" },
  { icon: "firewall", title: "Firewall Appliances", href: "/products/firewall-appliances" },
  { icon: "wifi", title: "Wi-Fi Access Points", href: "/products/wifi-access-points" },
  { icon: "cctv", title: "CCTV Cameras & NVR", href: "/products/ip-cctv-cameras" },
  { icon: "key", title: "Software Licenses", href: "/software-licensing" },
  { icon: "usb", title: "IT Accessories & Cables", href: "/products/it-accessories-cables" },
];

export const whyChoose = [
  { icon: "briefcase", title: "Business-focused IT solutions", text: "Recommendations start from your users, processes and budget — not from a product list." },
  { icon: "layers", title: "Multiple technology categories under one roof", text: "Software, hardware, networking, cloud, security and surveillance through one team." },
  { icon: "procurement", title: "Customised IT procurement", text: "Specifications, quantities and brands matched to your requirement, with consolidated quotations." },
  { icon: "renew", title: "License and renewal assistance", text: "Help choosing the right plans and keeping track of subscription renewals." },
  { icon: "route", title: "Network design and deployment", text: "Structured, documented networks — from cabling and racks to VLANs and Wi-Fi." },
  { icon: "headset", title: "Remote and on-site support options", text: "Support delivered remotely or on-site, depending on the issue and your agreement." },
  { icon: "rocket", title: "Scalable for growing businesses", text: "Solutions that can grow with new users, branches and cloud workloads." },
  { icon: "mail-check", title: "Centralised sales and support enquiries", text: "One email for sales, one Support Center for tickets — every request gets a reference number." },
];

export const industries = [
  { slug: "manufacturing", icon: "factory", title: "Manufacturing and Industrial Companies", summary: "Reliable networks across plants and offices, surveillance of production and perimeter areas, and rugged devices for shop floors.",
    solutions: ["Plant-wide LAN, fibre backbone and industrial-area Wi-Fi", "CCTV for production floors, gates and warehouses", "Firewalls and segmentation between office and production networks", "Barcode printers and scanners for traceability", "Server, backup and UPS planning for ERP systems"] },
  { slug: "corporate-offices", icon: "building", title: "Corporate Offices", summary: "Productive, secure workplaces with Microsoft 365, managed devices and well-documented networks.",
    solutions: ["Microsoft 365 licensing, migration and administration", "Business laptops, desktops and meeting-room equipment", "Structured cabling, racks and enterprise Wi-Fi", "Endpoint security and MFA", "IT AMC and helpdesk support"] },
  { slug: "healthcare", icon: "health", title: "Healthcare and Hospitals", summary: "Dependable IT for clinical and administrative teams, with attention to availability and access control.",
    solutions: ["Wi-Fi coverage planning across wards and departments", "Segmented networks for medical devices, staff and guests", "Backup and recovery planning for critical systems", "CCTV for entrances, pharmacies and public areas", "Identity and access controls for shared workstations"] },
  { slug: "education", icon: "education", title: "Education and Training", summary: "Campus connectivity, computer labs and collaboration tools for students, faculty and administration.",
    solutions: ["Campus Wi-Fi and network design", "Computer labs, projectors and displays", "Microsoft 365 for staff and student collaboration", "Content filtering via firewall policies", "CCTV for campus safety"] },
  { slug: "retail", icon: "store", title: "Retail and E-commerce", summary: "Consistent store IT, secure payments networks and surveillance across locations.",
    solutions: ["POS-ready desktops, barcode scanners and label printers", "Branch networking and site-to-site VPN", "In-store CCTV and remote viewing with authorisation", "Endpoint and email security", "Cloud collaboration for head office and stores"] },
  { slug: "logistics", icon: "truck", title: "Logistics and Warehousing", summary: "Coverage and visibility across large spaces — from loading docks to aisles.",
    solutions: ["Warehouse Wi-Fi planned for handheld scanners", "Barcode and mobile scanning devices", "Dock, aisle and perimeter CCTV", "Rack and network room organisation", "Connectivity between warehouses and head office"] },
  { slug: "startups-smes", icon: "rocket", title: "Startups and SMEs", summary: "Right-sized IT that is quick to set up, secure by default and ready to grow.",
    solutions: ["Microsoft 365 Business plans and tenant setup", "Laptops with standard configuration and security", "Simple, secure office network and Wi-Fi", "Cloud backup and device management", "Flexible support options"] },
  { slug: "enterprise", icon: "server", title: "Enterprise Organisations", summary: "Procurement and infrastructure support for multi-site organisations with formal IT processes.",
    solutions: ["Consolidated procurement across hardware and software", "Enterprise licensing guidance", "Multi-site networking and documentation", "Security tooling deployment with internal teams", "Infrastructure audits and upgrade roadmaps"] },
];

export const processSteps = [
  { title: "Share your requirement", text: "Tell us what you need through a quote request, email or a call with our team." },
  { title: "Assessment & recommendation", text: "We clarify scope, review your environment where needed and recommend suitable options." },
  { title: "Quotation", text: "You receive a written quotation with configuration, quantities and terms." },
  { title: "Delivery & deployment", text: "Products are delivered and, where agreed, installed and configured by our team." },
  { title: "Support & renewals", text: "We remain your point of contact for support, warranty coordination and renewals." },
];
