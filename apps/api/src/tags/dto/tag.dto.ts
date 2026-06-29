import { createZodDto } from 'nestjs-zod';
import {
  tagCategoryCreateSchema,
  tagCategoryPatchSchema,
  tagCategoryResponseSchema,
  tagCreateSchema,
  tagPatchSchema,
  tagResponseSchema,
} from '@repo/shared';

export class TagCategoryResponseDto extends createZodDto(
  tagCategoryResponseSchema,
) {}

export class TagCategoryCreateDto extends createZodDto(
  tagCategoryCreateSchema,
) {}

export class TagCategoryPatchDto extends createZodDto(tagCategoryPatchSchema) {}

export class TagResponseDto extends createZodDto(tagResponseSchema) {}

export class TagCreateDto extends createZodDto(tagCreateSchema) {}

export class TagPatchDto extends createZodDto(tagPatchSchema) {}
