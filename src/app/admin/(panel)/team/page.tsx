import { connectDB } from "@/lib/db";
import { TeamMember } from "@/lib/models/TeamMember";
import { toTeamDTO } from "@/lib/content/get";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  await connectDB();
  const docs = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
  return <TeamManager initial={docs.map((d) => toTeamDTO(d as unknown as Record<string, unknown> & { _id: unknown }))} />;
}
