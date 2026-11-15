import { Schema, model, models, type Model } from "mongoose";

export interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // TTL index: MongoDB removes the document once expiresAt passes
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const RateLimit: Model<RateLimitDoc> =
  models.RateLimit || model<RateLimitDoc>("RateLimit", RateLimitSchema);
