import { createZodDto } from 'nestjs-zod';
import { exportRequestSchema } from '@repo/shared';

export class ExportRequestDto extends createZodDto(exportRequestSchema) {}
