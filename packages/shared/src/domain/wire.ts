import { z } from 'zod';

import { entityIdSchema, timestampSchema } from './common.js';
import { itemBaseSchema } from './item.js';
import {
  educationDataSchema,
  emptyDataSchema,
  projectDataSchema,
  skillGroupDataSchema,
  textDataSchema,
  workDataSchema,
} from './item-data.js';
import { itemTagSchema } from './item.js';
import { basicsSchema } from './master-resume.js';

const wireItemBaseSchema = itemBaseSchema.omit({ masterId: true });

export const wireItemSchema = z.discriminatedUnion('section', [
  wireItemBaseSchema.extend({
    section: z.literal('work'),
    data: workDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('education'),
    data: educationDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('project'),
    data: projectDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('skillGroup'),
    data: skillGroupDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('skill'),
    data: textDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('bullet'),
    data: textDataSchema,
  }),
  wireItemBaseSchema.extend({
    section: z.literal('summary'),
    data: z.union([emptyDataSchema, textDataSchema]),
  }),
]);

export type WireItem = z.infer<typeof wireItemSchema>;

export const masterResumeGetSchema = z.object({
  id: entityIdSchema,
  basics: basicsSchema,
  items: z.array(wireItemSchema),
  itemTags: z.array(itemTagSchema),
  updatedAt: timestampSchema,
});

export type MasterResumeGet = z.infer<typeof masterResumeGetSchema>;

export const masterResumePutSchema = z.object({
  basics: basicsSchema,
  items: z.array(wireItemSchema),
  itemTags: z.array(itemTagSchema),
  updatedAt: timestampSchema.optional(),
});

export type MasterResumePut = z.infer<typeof masterResumePutSchema>;
