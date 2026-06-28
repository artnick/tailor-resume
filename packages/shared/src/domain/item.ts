import { z } from "zod";

import { entityIdSchema, timestampSchema } from "./common.js";
import {
  educationDataSchema,
  emptyDataSchema,
  projectDataSchema,
  skillGroupDataSchema,
  textDataSchema,
  workDataSchema,
} from "./item-data.js";

const itemBaseSchema = z.object({
  id: entityIdSchema,
  masterId: entityIdSchema,
  parentId: entityIdSchema.nullable().optional(),
  isChoiceGroup: z.boolean().default(false),
  isDefaultChoice: z.boolean().default(false),
  pinned: z.boolean().default(false),
  order: z.number().int(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
});

export const itemSchema = z.discriminatedUnion("section", [
  itemBaseSchema.extend({
    section: z.literal("work"),
    data: workDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("education"),
    data: educationDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("project"),
    data: projectDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("skillGroup"),
    data: skillGroupDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("skill"),
    data: textDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("bullet"),
    data: textDataSchema,
  }),
  itemBaseSchema.extend({
    section: z.literal("summary"),
    data: z.union([emptyDataSchema, textDataSchema]),
  }),
]);

export type Item = z.infer<typeof itemSchema>;

export const itemTagSchema = z.object({
  itemId: entityIdSchema,
  tagId: entityIdSchema,
});

export type ItemTag = z.infer<typeof itemTagSchema>;
