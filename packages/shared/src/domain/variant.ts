import { z } from "zod";

import { entityIdSchema, timestampSchema } from "./common.js";
import {
  educationDataOverrideSchema,
  projectDataOverrideSchema,
  skillGroupDataOverrideSchema,
  textDataOverrideSchema,
  workDataOverrideSchema,
} from "./item-data.js";

export const variantSchema = z.object({
  id: entityIdSchema,
  masterId: entityIdSchema,
  name: z.string().min(1),
  isFavorite: z.boolean().default(false),
  templateId: z.string().min(1),
  baseVariantId: entityIdSchema.nullable().optional(),
  targetCompany: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
});

export type Variant = z.infer<typeof variantSchema>;

export const variantTagSchema = z.object({
  variantId: entityIdSchema,
  tagId: entityIdSchema,
  priority: z.number().int().nonnegative(),
});

export type VariantTag = z.infer<typeof variantTagSchema>;

export const overrideDataSchema = z.union([
  workDataOverrideSchema,
  educationDataOverrideSchema,
  projectDataOverrideSchema,
  textDataOverrideSchema,
  skillGroupDataOverrideSchema,
]);

export const variantItemSchema = z.object({
  variantId: entityIdSchema,
  itemId: entityIdSchema,
  included: z.boolean(),
  order: z.number().int(),
  overrideData: overrideDataSchema.nullable().optional(),
  chosenAlternativeId: entityIdSchema.nullable().optional(),
  locked: z.boolean().default(false),
});

export type VariantItem = z.infer<typeof variantItemSchema>;

export const variantPayloadSchema = z.object({
  variant: variantSchema,
  tags: z.array(variantTagSchema),
  items: z.array(variantItemSchema),
});

export type VariantPayload = z.infer<typeof variantPayloadSchema>;
