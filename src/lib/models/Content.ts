import { Schema, model, models, type Model } from "mongoose";

export interface ContentDoc {
  key: string;
  data: unknown;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<ContentDoc>(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    updatedBy: String,
  },
  { timestamps: true, minimize: false },
);

export const Content: Model<ContentDoc> = models.Content || model<ContentDoc>("Content", ContentSchema);
