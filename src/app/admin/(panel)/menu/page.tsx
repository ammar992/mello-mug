import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { MenuItem } from "@/lib/models/MenuItem";
import { getContent, toCategoryDTO, toMenuItemDTO } from "@/lib/content/get";
import { MenuManager } from "./MenuManager";

export const metadata = { title: "Menu & prices" };

type Lean = Record<string, unknown> & { _id: unknown };

export default async function MenuPage() {
  await connectDB();
  const [cats, items, contact] = await Promise.all([
    Category.find().sort({ order: 1, createdAt: 1 }).lean(),
    MenuItem.find().sort({ order: 1, createdAt: 1 }).lean(),
    getContent("contact"),
  ]);
  return (
    <MenuManager
      initialCategories={cats.map((c) => toCategoryDTO(c as unknown as Lean))}
      initialItems={items.map((i) => toMenuItemDTO(i as unknown as Lean))}
      currency={contact.currency}
    />
  );
}
