import { categoriesCrud } from "@/lib/collections";

export const runtime = "nodejs";
export const GET = categoriesCrud.list;
export const POST = categoriesCrud.create;
