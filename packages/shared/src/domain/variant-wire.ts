import { z } from 'zod';

import { entityIdSchema, timestampSchema } from './common.js';
import {
  variantItemSchema,
  variantSchema,
  variantTagSchema,
} from './variant.js';

export const variantListItemSchema = variantSchema.pick({
  id: true,
  name: true,
  isFavorite: true,
  templateId: true,
  baseVariantId: true,
  targetCompany: true,
  jobDescription: true,
  createdAt: true,
  updatedAt: true,
});

export type VariantListItem = z.infer<typeof variantListItemSchema>;

export const wireVariantTagSchema = variantTagSchema.omit({ variantId: true });

export type WireVariantTag = z.infer<typeof wireVariantTagSchema>;

export const wireVariantItemSchema = variantItemSchema.omit({
  variantId: true,
});

export type WireVariantItem = z.infer<typeof wireVariantItemSchema>;

export const variantCreateSchema = z.object({
  name: z.string().min(1),
  templateId: z.string().min(1).optional(),
  baseVariantId: entityIdSchema.optional(),
  targetCompany: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
});

export type VariantCreate = z.infer<typeof variantCreateSchema>;

export const variantGetSchema = z.object({
  variant: variantListItemSchema,
  tags: z.array(wireVariantTagSchema),
  items: z.array(wireVariantItemSchema),
});

export type VariantGet = z.infer<typeof variantGetSchema>;

export const variantPutSchema = z.object({
  name: z.string().min(1),
  isFavorite: z.boolean().default(false),
  templateId: z.string().min(1),
  baseVariantId: entityIdSchema.nullable().optional(),
  targetCompany: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  tags: z.array(wireVariantTagSchema),
  items: z.array(wireVariantItemSchema),
  updatedAt: timestampSchema.optional(),
});

export type VariantPut = z.infer<typeof variantPutSchema>;
