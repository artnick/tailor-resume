import { createZodDto } from 'nestjs-zod';
import {
  variantCreateSchema,
  variantGetSchema,
  variantListItemSchema,
  variantPutSchema,
} from '@repo/shared';

export class VariantListItemDto extends createZodDto(variantListItemSchema) {}

export class VariantCreateDto extends createZodDto(variantCreateSchema) {}

export class VariantGetDto extends createZodDto(variantGetSchema) {}

export class VariantPutDto extends createZodDto(variantPutSchema) {}
