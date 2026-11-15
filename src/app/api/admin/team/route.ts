import { teamCrud } from "@/lib/collections";

export const runtime = "nodejs";
export const GET = teamCrud.list;
export const POST = teamCrud.create;
