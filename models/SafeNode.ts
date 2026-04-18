import mongoose, { Schema, Model } from "mongoose";

export interface SafeNodeDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: "pharmacy" | "cafe" | "bank" | "hospital" | "post";
  location: { type: "Point"; coordinates: [number, number] };
  phone?: string;
  hours?: string;
  is_active: boolean;
  is_partner: boolean;
  language_support: string[];
  accessibility: {
    wheelchair_access: boolean;
    ramp: boolean;
    elevator: boolean;
  };
}

const SafeNodeSchema = new Schema<SafeNodeDoc>({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["pharmacy", "cafe", "bank", "hospital", "post"],
    required: true,
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  phone: { type: String },
  hours: { type: String },
  is_active: { type: Boolean, default: true },
  is_partner: { type: Boolean, default: false },
  language_support: { type: [String], default: ["sk", "en"] },
  accessibility: {
    wheelchair_access: { type: Boolean, default: false },
    ramp: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
  },
});

SafeNodeSchema.index({ location: "2dsphere" });

export const SafeNode: Model<SafeNodeDoc> =
  mongoose.models.SafeNode || mongoose.model<SafeNodeDoc>("SafeNode", SafeNodeSchema);
