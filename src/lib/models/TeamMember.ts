import { Schema, model, models, type Model } from "mongoose";

export interface TeamMemberDoc {
  name: string;
  role: string;
  bio: string;
  photo: { url: string; publicId: string; alt: string };
  visible: boolean;
  mk: { role: string; bio: string };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<TeamMemberDoc>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    photo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      alt: { type: String, default: "" },
    },
    visible: { type: Boolean, default: true },
    mk: { role: { type: String, default: "" }, bio: { type: String, default: "" } },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const TeamMember: Model<TeamMemberDoc> = models.TeamMember || model<TeamMemberDoc>("TeamMember", TeamMemberSchema);
