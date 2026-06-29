import { z } from 'zod';

export const entityIdSchema = z.string().min(1);
export type EntityId = z.infer<typeof entityIdSchema>;

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Expected YYYY-MM or YYYY-MM-DD');

export const timestampSchema = z.coerce.date();

export type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;
