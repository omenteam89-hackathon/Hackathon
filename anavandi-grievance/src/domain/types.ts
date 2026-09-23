export type CategoryId = 'CLEANLINESS' | 'UNSAFE_DRIVING' | 'OVERCROWDING' | 'MISSED_STOP' | 'CONCESSION_DENIAL' | 'OTHER';

export type Status = 'SUBMITTED' | 'UNROUTED' | 'ASSIGNED_TO_DEPOT' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'AWAITING_INFO' | 'ESCALATED' | 'RESOLVED' | 'REJECTED' | 'REOPENED';

export type EscalationLevel = 0 | 1 | 2; // 0 depot, 1 regional, 2 head office

export type Lang = 'en' | 'ml' | 'hi' | 'ta';

export interface Category {
  id: CategoryId;
  label: Record<Lang, string>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  icon: string; // lucide icon name
}

export interface SlaRule {
  category: CategoryId;
  ackWithinHours: number; // depot must acknowledge within
  resolveWithinHours: number; // depot must resolve within
  escalateTo: { level: EscalationLevel; role: string; afterHours: number }[];
}

export interface Depot {
  id: string; // e.g. 'TVM-CTY'
  name: string; // 'Thiruvananthapuram City'
  region: string; // 'South'
  officerName: string; // shown to console users only
  email: string;
  phone: string; // used only by mock notifier
}

export interface RouteDepotMap {
  routeNo: string;
  routeName?: string;
  serviceType?: string;
  depotId: string;
}

export interface Evidence {
  id: string;
  kind: 'image' | 'video' | 'audio';
  name: string;
  sizeKb: number;
  dataUrl: string; // object URL / base64 for demo
}

export interface Complainant {
  // PRIVATE: never leaves console/passenger
  name?: string;
  phone?: string; // optional, for SMS updates
  lang: Lang;
}

export interface TimelineEvent {
  at: string; // ISO, simulated clock
  actor: 'SYSTEM' | 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';
  actorName?: string;
  type: 'CREATED' | 'ROUTED' | 'ACK' | 'ASSIGNED' | 'STATUS' | 'NOTE' | 'INFO_REQUEST' | 'ESCALATED' | 'RESOLVED' | 'REJECTED' | 'REOPENED' | 'TRANSFERRED' | 'NOTIFIED' | 'MERGED';
  message: string;
  internal?: boolean; // true = staff-only note
}

export interface Complaint {
  id: string; // 'GRV-2026-000123'
  createdAt: string; // ISO (simulated clock)
  incidentAt: string;
  busNo?: string; // 'KL-15-A-1234'
  routeNo: string; // '45A'
  category: CategoryId;
  location: { stopName?: string; lat?: number; lng?: number; areaBucket?: string };
  description: string;
  evidence: Evidence[];
  complainant: Complainant;
  depotId: string | null;
  status: Status;
  escalationLevel: EscalationLevel;
  assignedTo?: string;
  ackDeadline: string;
  resolveDeadline: string;
  slaPausedAt?: string;
  slaPausedTotalMs: number;
  resolution?: { note: string; action: string; at: string; by: string };
  rejection?: { reason: 'DUPLICATE' | 'INSUFFICIENT_INFO' | 'OUT_OF_SCOPE' | 'WRONG_ROUTE'; note: string; };
  duplicateOf?: string;
  mergedIds?: string[];
  verified: boolean; // allegation verified by depot? (privacy rule)
  timeline: TimelineEvent[];
}

export interface Notification {
  id: string;
  at: string;
  channel: 'SMS' | 'EMAIL';
  to: string; // masked when displayed
  audience: 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';
  complaintId: string;
  template: string;
  body: string;
}
