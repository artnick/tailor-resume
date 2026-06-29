import { z } from 'zod';

import { entityIdSchema, timestampSchema } from './common.js';
import { itemSchema, itemTagSchema } from './item.js';

export const basicsLocationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
});

export const basicsProfileSchema = z.object({
  network: z.string(),
  url: z.string(),
});

export const basicsSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: basicsLocationSchema.optional(),
  profiles: z.array(basicsProfileSchema).optional(),
});

export type Basics = z.infer<typeof basicsSchema>;

export const masterResumeSchema = z.object({
  id: entityIdSchema,
  basics: basicsSchema,
  items: z.array(itemSchema),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
});

export type MasterResume = z.infer<typeof masterResumeSchema>;

export const masterResumePayloadSchema = z.object({
  basics: basicsSchema,
  items: z.array(itemSchema),
  itemTags: z.array(itemTagSchema),
});

export type MasterResumePayload = z.infer<typeof masterResumePayloadSchema>;
