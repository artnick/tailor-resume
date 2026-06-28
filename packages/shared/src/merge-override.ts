import type { DeepPartial } from "./domain/common.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeOverride<T extends Record<string, unknown>>(
  data: T,
  overrideData: DeepPartial<T> | null | undefined,
): T {
  if (overrideData == null) {
    return data;
  }

  return mergeDeep(data, overrideData) as T;
}

function mergeDeep(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };

  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    if (overrideValue === undefined) {
      continue;
    }

    const baseValue = base[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = mergeDeep(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result;
}
