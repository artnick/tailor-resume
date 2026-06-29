import { createZodDto } from 'nestjs-zod';
import { masterResumeGetSchema, masterResumePutSchema } from '@repo/shared';

export class MasterResumeGetDto extends createZodDto(masterResumeGetSchema) {}

export class MasterResumePutDto extends createZodDto(masterResumePutSchema) {}
