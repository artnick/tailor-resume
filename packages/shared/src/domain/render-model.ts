import { z } from "zod";

import { dateStringSchema, entityIdSchema } from "./common.js";
import { basicsSchema } from "./master-resume.js";

export const renderBulletSchema = z.object({
  id: entityIdSchema,
  text: z.string(),
});

export type RenderBullet = z.infer<typeof renderBulletSchema>;

export const renderExperienceEntrySchema = z.object({
  id: entityIdSchema,
  company: z.string().optional(),
  name: z.string().optional(),
  position: z.string().optional(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.nullable(),
  location: z.string().optional(),
  url: z.string().optional(),
  bullets: z.array(renderBulletSchema),
});

export type RenderExperienceEntry = z.infer<typeof renderExperienceEntrySchema>;

export const renderSummaryBlockSchema = z.object({
  id: entityIdSchema,
  text: z.string(),
});

export type RenderSummaryBlock = z.infer<typeof renderSummaryBlockSchema>;

export const renderSkillSchema = z.object({
  id: entityIdSchema,
  text: z.string(),
});

export type RenderSkill = z.infer<typeof renderSkillSchema>;

export const renderSkillGroupSchema = z.object({
  id: entityIdSchema,
  name: z.string(),
  skills: z.array(renderSkillSchema),
});

export type RenderSkillGroup = z.infer<typeof renderSkillGroupSchema>;

export const renderModelSchema = z.object({
  basics: basicsSchema,
  templateId: z.string(),
  summary: z.array(renderSummaryBlockSchema),
  work: z.array(renderExperienceEntrySchema),
  education: z.array(renderExperienceEntrySchema),
  projects: z.array(renderExperienceEntrySchema),
  skillGroups: z.array(renderSkillGroupSchema),
  skills: z.array(renderSkillSchema),
});

export type RenderModel = z.infer<typeof renderModelSchema>;
