import { z } from 'zod';

export const exportRequestSchema = z.object({
  format: z.enum(['pdf']).default('pdf'),
  templateId: z.string().optional(),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
