import type { HelperDoc } from "@/models/Helper";
import type { KarmaLogDoc } from "@/models/KarmaLog";
import type { RatingDoc } from "@/models/Rating";
import type { RequestDoc } from "@/models/Request";
import type { SafeNodeDoc } from "@/models/SafeNode";
import type { UserDoc } from "@/models/User";

export function serializeUser(user: UserDoc) {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    karma_points: user.karma_points,
    level: user.level,
    language_preference: user.language_preference,
    is_blind: user.is_blind,
    accessibility_notes: user.accessibility_notes,
  };
}

export function serializeRequest(request: RequestDoc) {
  return {
    _id: request._id.toString(),
    requester_id: request.requester_id.toString(),
    title: request.title,
    description: request.description,
    category: request.category,
    urgency: request.urgency,
    status: request.status,
    location: request.location,
    estimated_duration: request.estimated_duration,
    accessibility_notes: request.accessibility_notes,
    accepted_by: request.accepted_by ? request.accepted_by.toString() : null,
    created_at: request.created_at.toISOString(),
    completed_at: request.completed_at ? request.completed_at.toISOString() : null,
  };
}

export function serializeSafeNode(node: SafeNodeDoc) {
  return {
    _id: node._id.toString(),
    name: node.name,
    category: node.category,
    location: node.location,
    phone: node.phone,
    hours: node.hours,
    is_partner: node.is_partner,
    accessibility: node.accessibility,
  };
}

export function serializeHelper(helper: HelperDoc, name = "Volunteer") {
  return {
    _id: helper._id.toString(),
    user_id: helper.user_id.toString(),
    name,
    current_location: helper.current_location,
    is_online: helper.is_online,
    current_request_id: helper.current_request_id ? helper.current_request_id.toString() : null,
    updated_at: helper.updated_at.toISOString(),
  };
}

export function serializeKarmaLog(entry: KarmaLogDoc) {
  return {
    _id: entry._id.toString(),
    user_id: entry.user_id.toString(),
    action: entry.action,
    points_awarded: entry.points_awarded,
    request_id: entry.request_id?.toString() ?? null,
    created_at: entry.created_at.toISOString(),
  };
}

export function serializeRating(entry: RatingDoc) {
  return {
    _id: entry._id.toString(),
    from_user_id: entry.from_user_id.toString(),
    to_user_id: entry.to_user_id.toString(),
    request_id: entry.request_id.toString(),
    rating: entry.rating,
    comment: entry.comment,
    created_at: entry.created_at.toISOString(),
  };
}
