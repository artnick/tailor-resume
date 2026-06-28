import { z } from "zod";

import { entityIdSchema } from "./common.js";

export const tagCategorySchema = z.object({
  id: entityIdSchema,
  key: z.string().min(1),
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  color: z.string().nullable().optional(),
});

export type TagCategory = z.infer<typeof tagCategorySchema>;

export const tagSchema = z.object({
  id: entityIdSchema,
  label: z.string().min(1),
  categoryId: entityIdSchema,
});

export type Tag = z.infer<typeof tagSchema>;
