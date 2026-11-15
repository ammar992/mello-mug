import { teamCrud } from "@/lib/collections";

export const runtime = "nodejs";
export const PUT = teamCrud.update;
export const DELETE = teamCrud.remove;
