import { Schema, model, models, type Model } from "mongoose";

export interface CategoryDoc {
  name: string;
  description: string;
  visible: boolean;
  mk: { name: string; description: string };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    mk: { name: { type: String, default: "" }, description: { type: String, default: "" } },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const Category: Model<CategoryDoc> = models.Category || model<CategoryDoc>("Category", CategorySchema);
