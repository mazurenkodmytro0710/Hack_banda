import mongoose, { Schema, Model } from "mongoose";
import type { RequestCategory, RequestStatus, RequestUrgency } from "@/lib/types";
import { REQUEST_EXPIRY_MINUTES } from "@/lib/constants";

export interface RequestDoc {
  _id: mongoose.Types.ObjectId;
  requester_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  status: RequestStatus;
  location: { type: "Point"; coordinates: [number, number] };
  estimated_duration?: number;
  accessibility_notes?: string;
  accepted_by?: mongoose.Types.ObjectId | null;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  expires_at: Date;
}

const RequestSchema = new Schema<RequestDoc>({
  requester_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: {
    type: String,
    enum: ["transport", "shopping", "stairs", "medical", "other"],
    required: true,
  },
  urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
    index: true,
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  estimated_duration: { type: Number },
  accessibility_notes: { type: String },
  accepted_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  started_at: { type: Date },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + REQUEST_EXPIRY_MINUTES * 60_000),
  },
});

RequestSchema.index({ location: "2dsphere" });
RequestSchema.index({ status: 1, created_at: -1 });

export const HelpRequest: Model<RequestDoc> =
  mongoose.models.HelpRequest || mongoose.model<RequestDoc>("HelpRequest", RequestSchema);
