import { Schema, Types, model, models, type Model } from "mongoose";

export interface MenuItemDoc {
  name: string;
  description: string;
  price: number;
  categoryId: Types.ObjectId;
  image: { url: string; publicId: string; alt: string };
  featured: boolean;
  bestseller: boolean;
  visible: boolean;
  tags: string[];
  mk: { name: string; description: string; tags: string[] };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<MenuItemDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      alt: { type: String, default: "" },
    },
    featured: { type: Boolean, default: false, index: true },
    bestseller: { type: Boolean, default: false, index: true },
    visible: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    mk: { name: { type: String, default: "" }, description: { type: String, default: "" }, tags: { type: [String], default: [] } },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
MenuItemSchema.index({ categoryId: 1, order: 1 });

export const MenuItem: Model<MenuItemDoc> = models.MenuItem || model<MenuItemDoc>("MenuItem", MenuItemSchema);
