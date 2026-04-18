import { z } from "zod";

const latitudeSchema = z.coerce.number().min(-90).max(90);
const longitudeSchema = z.coerce.number().min(-180).max(180);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(80),
  role: z.enum(["REQUESTER", "HELPER"]),
  phone: z.string().optional(),
  language_preference: z.enum(["en", "uk", "sk"]).optional(),
  is_blind: z.boolean().optional(),
  accessibility_notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createRequestSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().default(""),
  category: z.enum(["transport", "shopping", "stairs", "medical", "other"]),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  lat: latitudeSchema,
  lng: longitudeSchema,
  estimated_duration: z.coerce.number().positive().optional(),
  accessibility_notes: z.string().optional(),
});

export const requestIdSchema = z.object({
  request_id: z.string().min(1),
});

export const locationSchema = z.object({
  lat: latitudeSchema,
  lng: longitudeSchema,
});

export const helperPingSchema = locationSchema.extend({
  is_online: z.boolean().optional(),
  current_request_id: z.string().nullable().optional(),
});

export const ratingSchema = z.object({
  request_id: z.string(),
  to_user_id: z.string(),
  rating: z.union([z.literal(1), z.literal(-1)]),
  comment: z.string().optional(),
});

export const karmaAdjustSchema = z.object({
  action: z.enum([
    "helped",
    "positive_rating",
    "negative_rating",
    "requested",
    "completed_request",
  ]),
  points_awarded: z.coerce.number().int(),
  request_id: z.string().optional(),
});

export const languagePreferenceSchema = z.object({
  language_preference: z.enum(["en", "uk", "sk"]),
});
