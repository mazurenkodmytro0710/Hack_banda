import mongoose, { Schema, Model } from "mongoose";
import type { Locale, Role, UserLevel } from "@/lib/types";

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  phone?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  karma_points: number;
  level: UserLevel;
  language_preference: Locale;
  is_blind: boolean;
  accessibility_notes?: string;
  is_verified: boolean;
  created_at: Date;
  last_login?: Date;
}

const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ["REQUESTER", "HELPER"], required: true },
  phone: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [21.2611, 48.7164] },
  },
  karma_points: { type: Number, default: 0 },
  level: { type: String, enum: ["Neighbor", "Guardian", "Hero"], default: "Neighbor" },
  language_preference: { type: String, enum: ["en", "uk", "sk"], default: "en" },
  is_blind: { type: Boolean, default: false },
  accessibility_notes: { type: String },
  is_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date },
});

UserSchema.index({ location: "2dsphere" });

// Keep level in sync with karma on save
UserSchema.pre("save", function (this: UserDoc, next) {
  if (this.karma_points >= 250) this.level = "Hero";
  else if (this.karma_points >= 100) this.level = "Guardian";
  else this.level = "Neighbor";
  next();
});

export const User: Model<UserDoc> =
  mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
