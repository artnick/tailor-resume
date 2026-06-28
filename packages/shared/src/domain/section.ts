import { z } from "zod";

export const sectionSchema = z.enum([
  "work",
  "education",
  "project",
  "skillGroup",
  "skill",
  "summary",
  "bullet",
]);

export type Section = z.infer<typeof sectionSchema>;
