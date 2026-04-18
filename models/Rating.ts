import mongoose, { Schema, Model } from "mongoose";

export interface RatingDoc {
  _id: mongoose.Types.ObjectId;
  from_user_id: mongoose.Types.ObjectId;
  to_user_id: mongoose.Types.ObjectId;
  request_id: mongoose.Types.ObjectId;
  rating: 1 | -1;
  comment?: string;
  created_at: Date;
}

const RatingSchema = new Schema<RatingDoc>({
  from_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  request_id: { type: Schema.Types.ObjectId, ref: "HelpRequest", required: true },
  rating: { type: Number, enum: [1, -1], required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now },
});

RatingSchema.index({ from_user_id: 1, request_id: 1 }, { unique: true });

export const Rating: Model<RatingDoc> =
  mongoose.models.Rating || mongoose.model<RatingDoc>("Rating", RatingSchema);
