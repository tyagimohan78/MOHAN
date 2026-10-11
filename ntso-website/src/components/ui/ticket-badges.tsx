import type { EnquiryStatus, TicketPriority, TicketStatus } from "@prisma/client";
import { Badge } from "./notice";

const statusTone: Record<TicketStatus, "navy" | "cyan" | "green" | "amber" | "red" | "slate"> = {
  OPEN: "cyan",
  ASSIGNED: "navy",
  IN_PROGRESS: "navy",
  WAITING_FOR_CUSTOMER: "amber",
  RESOLVED: "green",
  CLOSED: "slate",
};
const statusLabel: Record<TicketStatus, string> = { OPEN: "Open", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", WAITING_FOR_CUSTOMER: "Waiting for Customer", RESOLVED: "Resolved", CLOSED: "Closed" };
const prioTone: Record<TicketPriority, "slate" | "navy" | "amber" | "red"> = { LOW: "slate", MEDIUM: "navy", HIGH: "amber", CRITICAL: "red" };

export const TicketStatusBadge = ({ status }: { status: TicketStatus }) => <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
export const PriorityBadge = ({ priority }: { priority: TicketPriority }) => <Badge tone={prioTone[priority]}>{priority.charAt(0) + priority.slice(1).toLowerCase()} priority</Badge>;

const enqTone: Record<EnquiryStatus, "navy" | "cyan" | "green" | "amber" | "red" | "slate"> = { NEW: "cyan", CONTACTED: "navy", QUALIFIED: "navy", QUOTED: "amber", WON: "green", LOST: "red", CLOSED: "slate" };
export const EnquiryStatusBadge = ({ status }: { status: EnquiryStatus }) => <Badge tone={enqTone[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
