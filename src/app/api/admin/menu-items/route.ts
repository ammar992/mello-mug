import { menuItemsCrud } from "@/lib/collections";

export const runtime = "nodejs";
export const GET = menuItemsCrud.list;
export const POST = menuItemsCrud.create;
