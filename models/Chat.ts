import mongoose, { Schema, Model } from "mongoose";

export interface ChatDoc {
  _id: mongoose.Types.ObjectId;
  request_id: mongoose.Types.ObjectId;
  sender_id: mongoose.Types.ObjectId;
  recipient_id: mongoose.Types.ObjectId;
  message: string;
  message_type: "text" | "voice" | "system";
  is_read: boolean;
  read_at?: Date;
  was_played_by_tts: boolean;
  created_at: Date;
}

const ChatSchema = new Schema<ChatDoc>({
  request_id: { type: Schema.Types.ObjectId, ref: "HelpRequest", required: true, index: true },
  sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recipient_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  message_type: { type: String, enum: ["text", "voice", "system"], default: "text" },
  is_read: { type: Boolean, default: false },
  read_at: { type: Date },
  was_played_by_tts: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now, index: true },
});

ChatSchema.index({ request_id: 1, created_at: 1 });

export const Chat: Model<ChatDoc> =
  mongoose.models.Chat || mongoose.model<ChatDoc>("Chat", ChatSchema);
