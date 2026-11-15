import { Schema, model, models, type Model } from "mongoose";

export interface MediaDoc {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalName: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<MediaDoc>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    width: Number,
    height: Number,
    bytes: Number,
    format: String,
    originalName: { type: String, default: "" },
  },
  { timestamps: true },
);
MediaSchema.index({ createdAt: -1 });

export const Media: Model<MediaDoc> = models.Media || model<MediaDoc>("Media", MediaSchema);
