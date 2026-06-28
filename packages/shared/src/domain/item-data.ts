import { z } from "zod";

import { dateStringSchema } from "./common.js";

const experienceFieldsSchema = z.object({
  position: z.string().optional(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.nullable(),
  location: z.string().optional(),
  url: z.string().optional(),
});

export const workDataSchema = experienceFieldsSchema.extend({
  company: z.string(),
});

export const educationDataSchema = experienceFieldsSchema.extend({
  name: z.string(),
});

export const projectDataSchema = experienceFieldsSchema.extend({
  name: z.string(),
});

export const textDataSchema = z.object({
  text: z.string(),
});

export const skillGroupDataSchema = z.object({
  name: z.string(),
});

export const emptyDataSchema = z.object({}).strict();

export type WorkData = z.infer<typeof workDataSchema>;
export type EducationData = z.infer<typeof educationDataSchema>;
export type ProjectData = z.infer<typeof projectDataSchema>;
export type TextData = z.infer<typeof textDataSchema>;
export type SkillGroupData = z.infer<typeof skillGroupDataSchema>;
export type EmptyData = z.infer<typeof emptyDataSchema>;

export type ItemData =
  | WorkData
  | EducationData
  | ProjectData
  | TextData
  | SkillGroupData
  | EmptyData;

export const workDataOverrideSchema = workDataSchema.partial();
export const educationDataOverrideSchema = educationDataSchema.partial();
export const projectDataOverrideSchema = projectDataSchema.partial();
export const textDataOverrideSchema = textDataSchema.partial();
export const skillGroupDataOverrideSchema = skillGroupDataSchema.partial();
