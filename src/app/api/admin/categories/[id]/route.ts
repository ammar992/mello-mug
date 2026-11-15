import { categoriesCrud } from "@/lib/collections";

export const runtime = "nodejs";
export const PUT = categoriesCrud.update;
export const DELETE = categoriesCrud.remove;
