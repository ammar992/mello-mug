import { Schema, model, models, type Model } from "mongoose";

export interface AdminDoc {
  email: string;
  name: string;
  passwordHash: string;
  /** Incremented on password change / forced logout to invalidate existing sessions */
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const Admin: Model<AdminDoc> = models.Admin || model<AdminDoc>("Admin", AdminSchema);
