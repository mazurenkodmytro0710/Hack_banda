import mongoose, { Schema, Model } from "mongoose";
import type { KarmaAction } from "@/lib/types";

export interface KarmaLogDoc {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  action: KarmaAction;
  points_awarded: number;
  request_id?: mongoose.Types.ObjectId;
  created_at: Date;
}

const KarmaLogSchema = new Schema<KarmaLogDoc>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: {
    type: String,
    enum: ["helped", "positive_rating", "negative_rating", "requested", "completed_request"],
    required: true,
  },
  points_awarded: { type: Number, required: true },
  request_id: { type: Schema.Types.ObjectId, ref: "HelpRequest" },
  created_at: { type: Date, default: Date.now },
});

export const KarmaLog: Model<KarmaLogDoc> =
  mongoose.models.KarmaLog || mongoose.model<KarmaLogDoc>("KarmaLog", KarmaLogSchema);
