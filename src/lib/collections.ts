import "server-only";
import { createCrud } from "@/lib/crud";
import { Category } from "@/lib/models/Category";
import { MenuItem } from "@/lib/models/MenuItem";
import { TeamMember } from "@/lib/models/TeamMember";
import { toCategoryDTO, toMenuItemDTO, toTeamDTO } from "@/lib/content/get";
import { categoryInputSchema, menuItemInputSchema, teamInputSchema } from "@/lib/content/schema";

export const categoriesCrud = createCrud({
  model: Category,
  schema: categoryInputSchema,
  toDTO: toCategoryDTO,
  label: "Category",
  beforeDelete: async (id) => {
    const n = await MenuItem.countDocuments({ categoryId: id });
    return n > 0 ? `This category still has ${n} menu item${n === 1 ? "" : "s"}. Move or delete them first.` : null;
  },
});

export const menuItemsCrud = createCrud({
  model: MenuItem,
  schema: menuItemInputSchema,
  toDTO: toMenuItemDTO,
  label: "Menu item",
  validate: async (data) => ((await Category.exists({ _id: data.categoryId })) ? null : "The selected category no longer exists"),
});

export const teamCrud = createCrud({
  model: TeamMember,
  schema: teamInputSchema,
  toDTO: toTeamDTO,
  label: "Team member",
});
