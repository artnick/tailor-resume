import type { VariantItem, VariantTag } from "../domain/variant.js";
import {
  buildTailoringIndexes,
  generateOverlayEntries,
  groupOverlayByParent,
  mergeUnlockedEntry,
  sortSiblingGroup,
  type TailoringContext,
} from "./utils.js";

export type AddTagSoftInput = TailoringContext & {
  existingTags: VariantTag[];
  existingOverlay: VariantItem[];
  newTagId: string;
};

export type TagSoftResult = {
  tags: VariantTag[];
  overlay: VariantItem[];
};

export function addTagSoft(input: AddTagSoftInput): TagSoftResult {
  const maxPriority = input.existingTags.reduce(
    (max, tag) => Math.max(max, tag.priority),
    -1,
  );
  const tags = [
    ...input.existingTags,
    {
      variantId: input.variantId,
      tagId: input.newTagId,
      priority: maxPriority + 1,
    },
  ];
  const selectedTagIds = [...tags]
    .sort((left, right) => left.priority - right.priority)
    .map((tag) => tag.tagId);

  const indexes = buildTailoringIndexes({
    ...input,
    selectedTagIds,
  });
  const freshOverlay = generateOverlayEntries(indexes);
  const freshByItemId = new Map(
    freshOverlay.map((entry) => [entry.itemId, entry]),
  );
  const existingGroups = groupOverlayByParent(indexes, input.existingOverlay);
  const overlay: VariantItem[] = [];

  for (const [parentKey, groupItems] of indexes.siblingGroups) {
    const existingGroup = existingGroups.get(parentKey) ?? [];
    const existingItemIds = new Set(existingGroup.map((entry) => entry.itemId));
    const mergedGroup: VariantItem[] = [];
    let nextOrder = 0;

    for (const existing of existingGroup) {
      const fresh = freshByItemId.get(existing.itemId);
      if (fresh == null) {
        continue;
      }

      if (existing.locked) {
        mergedGroup.push({ ...existing, order: nextOrder });
      } else {
        mergedGroup.push(mergeUnlockedEntry(existing, fresh, nextOrder));
      }

      nextOrder += 1;
    }

    const appendedItems = sortSiblingGroup(
      indexes,
      groupItems.filter((item) => {
        if (existingItemIds.has(item.id)) {
          return false;
        }

        return freshByItemId.get(item.id)?.included === true;
      }),
    );

    for (const item of appendedItems) {
      const fresh = freshByItemId.get(item.id);
      if (fresh == null) {
        continue;
      }

      mergedGroup.push({ ...fresh, order: nextOrder });
      nextOrder += 1;
    }

    overlay.push(...mergedGroup);
  }

  return { tags, overlay };
}

export type RemoveTagSoftInput = TailoringContext & {
  existingTags: VariantTag[];
  existingOverlay: VariantItem[];
  tagIdToRemove: string;
};

export function removeTagSoft(input: RemoveTagSoftInput): TagSoftResult {
  const tags = input.existingTags
    .filter((tag) => tag.tagId !== input.tagIdToRemove)
    .sort((left, right) => left.priority - right.priority);

  const selectedTagIds = tags.map((tag) => tag.tagId);
  const indexes = buildTailoringIndexes({
    ...input,
    selectedTagIds,
  });
  const freshByItemId = new Map(
    generateOverlayEntries(indexes).map((entry) => [entry.itemId, entry]),
  );
  const overlay: VariantItem[] = [];

  for (const existing of input.existingOverlay) {
    if (existing.locked) {
      overlay.push(existing);
      continue;
    }

    const fresh = freshByItemId.get(existing.itemId);
    if (fresh == null || !fresh.included) {
      continue;
    }

    overlay.push({
      ...fresh,
      order: existing.order,
      overrideData: existing.overrideData,
      locked: false,
    });
  }

  return { tags, overlay };
}
