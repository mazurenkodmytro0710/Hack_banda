import mongoose, { Schema, Model } from "mongoose";

export interface HelperDoc {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  current_location: { type: "Point"; coordinates: [number, number] };
  is_online: boolean;
  current_request_id: mongoose.Types.ObjectId | null;
  updated_at: Date;
}

const HelperSchema = new Schema<HelperDoc>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  current_location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  is_online: { type: Boolean, default: true },
  current_request_id: { type: Schema.Types.ObjectId, ref: "HelpRequest", default: null },
  updated_at: { type: Date, default: Date.now },
});

HelperSchema.index({ current_location: "2dsphere" });

export const HelperStatus: Model<HelperDoc> =
  mongoose.models.HelperStatus || mongoose.model<HelperDoc>("HelperStatus", HelperSchema);
