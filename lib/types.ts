export type Role = "REQUESTER" | "HELPER";
export type RequestCategory = "transport" | "shopping" | "stairs" | "medical" | "other";
export type RequestUrgency = "low" | "medium" | "high";
export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type UserLevel = "Neighbor" | "Guardian" | "Hero";
export type SafeNodeCategory = "pharmacy" | "cafe" | "bank" | "hospital" | "post";
export type KarmaAction =
  | "helped"
  | "positive_rating"
  | "negative_rating"
  | "requested"
  | "completed_request";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface PublicUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  karma_points: number;
  level: UserLevel;
  accessibility_notes?: string;
}

export interface HelpRequestDTO {
  _id: string;
  requester_id: string;
  requester_name: string;
  requester_karma: number;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  status: RequestStatus;
  location: GeoPoint;
  estimated_duration?: number;
  accepted_by?: string | null;
  created_at: string;
  completed_at?: string | null;
  accessibility_notes?: string;
}

export interface SafeNodeDTO {
  _id: string;
  name: string;
  category: SafeNodeCategory;
  location: GeoPoint;
  phone?: string;
  hours?: string;
  is_partner: boolean;
  accessibility: {
    wheelchair_access: boolean;
    ramp: boolean;
    elevator: boolean;
  };
}

export interface HelperPresenceDTO {
  _id: string;
  user_id: string;
  name: string;
  current_location: GeoPoint;
  is_online: boolean;
  current_request_id?: string | null;
  updated_at: string;
}

export interface ParsedIntent {
  category: RequestCategory;
  urgency: RequestUrgency;
  title: string;
  description: string;
  estimated_duration: number;
  accessibility_notes?: string;
}

export const KARMA_REWARDS = {
  helped: 25,
  completed_request: 25,
  positive_rating: 10,
  negative_rating: -5,
  requested: 0,
} as const;

export const CATEGORY_ICONS: Record<RequestCategory, string> = {
  transport: "🚗",
  shopping: "🛒",
  stairs: "🪜",
  medical: "🏥",
  other: "🤝",
};

export const URGENCY_COLORS: Record<RequestUrgency, string> = {
  low: "#00CC00",
  medium: "#FFD700",
  high: "#E60000",
};
