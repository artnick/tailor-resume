import { z } from 'zod';

import { entityIdSchema } from './common.js';
import { tagCategorySchema, tagSchema } from './tag.js';

export const tagCategoryCreateSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  color: z.string().nullable().optional(),
});

export type TagCategoryCreate = z.infer<typeof tagCategoryCreateSchema>;

export const tagCategoryPatchSchema = tagCategoryCreateSchema.partial();

export type TagCategoryPatch = z.infer<typeof tagCategoryPatchSchema>;

export const tagCreateSchema = z.object({
  label: z.string().min(1),
  categoryId: entityIdSchema,
});

export type TagCreate = z.infer<typeof tagCreateSchema>;

export const tagPatchSchema = z.object({
  label: z.string().min(1).optional(),
  categoryId: entityIdSchema.optional(),
});

export type TagPatch = z.infer<typeof tagPatchSchema>;

export const tagCategoryResponseSchema = tagCategorySchema;

export const tagResponseSchema = tagSchema;
