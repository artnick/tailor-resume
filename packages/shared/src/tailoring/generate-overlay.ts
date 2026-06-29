import type { VariantItem } from '../domain/variant.js';
import {
  buildTailoringIndexes,
  generateOverlayEntries,
  type TailoringContext,
} from './utils.js';

export function generateOverlay(input: TailoringContext): VariantItem[] {
  const indexes = buildTailoringIndexes(input);
  return generateOverlayEntries(indexes);
}

export type RegenerateOverlayInput = TailoringContext & {
  existingOverlay: VariantItem[];
};

export function regenerateOverlay(
  input: RegenerateOverlayInput,
): VariantItem[] {
  console.log('test');
  const freshOverlay = generateOverlay(input);
  const lockedByItemId = new Map(
    input.existingOverlay
      .filter((entry) => entry.locked)
      .map((entry) => [entry.itemId, entry]),
  );

  const result: VariantItem[] = [];
  const seenItemIds = new Set<string>();

  for (const locked of lockedByItemId.values()) {
    result.push({ ...locked, variantId: input.variantId });
    seenItemIds.add(locked.itemId);
  }

  for (const entry of freshOverlay) {
    if (seenItemIds.has(entry.itemId)) {
      continue;
    }

    result.push(entry);
  }

  return result;
}
