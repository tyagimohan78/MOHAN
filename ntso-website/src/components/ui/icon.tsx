import {
  Activity, Archive, BadgeCheck, BatteryCharging, Boxes, BrickWall, Briefcase, Building2, Cable, Camera, Cctv, Cloud, CloudCog, Cpu,
  Database, Factory, FileKey, FileText, Fingerprint, GraduationCap, HardDrive, Headset, HeartPulse, KeyRound, Laptop, Layers, LifeBuoy,
  Lock, MailCheck, MemoryStick, Monitor, MonitorCog, MonitorSmartphone, Mouse, Network, Package, PackageSearch, Printer, RefreshCw,
  Rocket, Route, Router, ScanBarcode, ScanLine, SearchCheck, Server, ServerCog, Shield, ShieldAlert, ShieldCheck, ShoppingCart, Store,
  Truck, Usb, Users, Video, Wifi, Workflow, Wrench, type LucideIcon,
} from "lucide-react";

// String keys let icons be stored in the database (ProductCategory.icon) and chosen in the admin panel.
export const ICONS: Record<string, LucideIcon> = {
  activity: Activity, archive: Archive, badge: BadgeCheck, battery: BatteryCharging, boxes: Boxes, firewall: BrickWall, briefcase: Briefcase,
  building: Building2, cable: Cable, camera: Camera, cctv: Cctv, cloud: Cloud, "cloud-cog": CloudCog, cpu: Cpu, database: Database,
  factory: Factory, "file-key": FileKey, file: FileText, fingerprint: Fingerprint, education: GraduationCap, "hard-drive": HardDrive,
  headset: Headset, health: HeartPulse, key: KeyRound, laptop: Laptop, layers: Layers, lifebuoy: LifeBuoy, lock: Lock, "mail-check": MailCheck,
  memory: MemoryStick, monitor: Monitor, "monitor-cog": MonitorCog, devices: MonitorSmartphone, mouse: Mouse, network: Network, package: Package,
  procurement: PackageSearch, printer: Printer, renew: RefreshCw, rocket: Rocket, route: Route, router: Router, barcode: ScanBarcode,
  scanner: ScanLine, audit: SearchCheck, server: Server, "server-cog": ServerCog, shield: Shield, "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck, cart: ShoppingCart, store: Store, truck: Truck, usb: Usb, users: Users, video: Video, wifi: Wifi,
  workflow: Workflow, wrench: Wrench,
};
export const ICON_KEYS = Object.keys(ICONS).sort();

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const C = ICONS[name] || Package;
  return <C className={className} aria-hidden="true" strokeWidth={1.75} />;
}

/** Rounded gradient tile used on cards. */
export function IconTile({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-lg" : "h-12 w-12 rounded-xl";
  const ic = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4.5 w-4.5" : "h-6 w-6";
  return (
    <span className={`inline-grid shrink-0 place-items-center bg-gradient-to-br from-navy-800 to-navy-950 text-electric-400 ring-1 ring-navy-700/40 ${box}`}>
      <Icon name={name} className={ic} />
    </span>
  );
}
