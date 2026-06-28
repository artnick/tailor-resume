import type { Item } from "../domain/item.js";
import type { ItemTag } from "../domain/item.js";
import type { VariantItem } from "../domain/variant.js";

export const INFINITE_RANK = Number.MAX_SAFE_INTEGER;

export type TailoringContext = {
  variantId: string;
  items: Item[];
  itemTags: ItemTag[];
  selectedTagIds: string[];
};

export type TailoringIndexes = {
  variantId: string;
  itemMap: Map<string, Item>;
  childrenByParentId: Map<string, Item[]>;
  itemTagsMap: Map<string, Set<string>>;
  selectedTagIds: string[];
  siblingGroups: Map<string, Item[]>;
};

export function buildTailoringIndexes(
  input: TailoringContext,
): TailoringIndexes {
  const itemMap = new Map<string, Item>();
  const childrenByParentId = new Map<string, Item[]>();
  const itemTagsMap = new Map<string, Set<string>>();

  for (const item of input.items) {
    itemMap.set(item.id, item);
    if (item.parentId != null) {
      const siblings = childrenByParentId.get(item.parentId) ?? [];
      siblings.push(item);
      childrenByParentId.set(item.parentId, siblings);
    }
  }

  for (const { itemId, tagId } of input.itemTags) {
    const tags = itemTagsMap.get(itemId) ?? new Set<string>();
    tags.add(tagId);
    itemTagsMap.set(itemId, tags);
  }

  const siblingGroups = new Map<string, Item[]>();
  for (const item of input.items) {
    if (!isOverlayEligible(item, itemMap)) {
      continue;
    }

    const parentKey = getParentKey(item);
    const group = siblingGroups.get(parentKey) ?? [];
    group.push(item);
    siblingGroups.set(parentKey, group);
  }

  return {
    variantId: input.variantId,
    itemMap,
    childrenByParentId,
    itemTagsMap,
    selectedTagIds: input.selectedTagIds,
    siblingGroups,
  };
}

export function isOverlayEligible(
  item: Item,
  itemMap: Map<string, Item>,
): boolean {
  if (item.parentId == null) {
    return true;
  }

  const parent = itemMap.get(item.parentId);
  return parent?.isChoiceGroup !== true;
}

export function getParentKey(item: Item): string {
  return item.parentId ?? "__root__";
}

export function getItemTagIds(
  indexes: TailoringIndexes,
  itemId: string,
): Set<string> {
  return indexes.itemTagsMap.get(itemId) ?? new Set<string>();
}

export function computeRank(
  itemTagIds: Set<string>,
  selectedTagIds: string[],
): number {
  let minRank = INFINITE_RANK;

  for (let index = 0; index < selectedTagIds.length; index += 1) {
    const tagId = selectedTagIds[index];
    if (tagId != null && itemTagIds.has(tagId)) {
      minRank = Math.min(minRank, index);
    }
  }

  return minRank;
}

export function computeIncluded(
  item: Item,
  itemTagIds: Set<string>,
  selectedTagIds: string[],
): boolean {
  if (item.pinned) {
    return true;
  }

  if (itemTagIds.size === 0) {
    return true;
  }

  for (const tagId of selectedTagIds) {
    if (itemTagIds.has(tagId)) {
      return true;
    }
  }

  return false;
}

export function compareByRank(
  indexes: TailoringIndexes,
  left: Item,
  right: Item,
): number {
  const leftRank = computeRank(
    getItemTagIds(indexes, left.id),
    indexes.selectedTagIds,
  );
  const rightRank = computeRank(
    getItemTagIds(indexes, right.id),
    indexes.selectedTagIds,
  );

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.order - right.order;
}

export function chooseAlternative(
  indexes: TailoringIndexes,
  parent: Item,
): Item | undefined {
  const children = indexes.childrenByParentId.get(parent.id) ?? [];
  if (children.length === 0) {
    return undefined;
  }

  let bestChild: Item | undefined;
  let bestRank = INFINITE_RANK;

  for (const child of children) {
    const rank = computeRank(
      getItemTagIds(indexes, child.id),
      indexes.selectedTagIds,
    );

    if (
      bestChild == null ||
      rank < bestRank ||
      (rank === bestRank && child.order < bestChild.order)
    ) {
      bestChild = child;
      bestRank = rank;
    }
  }

  if (bestRank === INFINITE_RANK) {
    return (
      children.find((child) => child.isDefaultChoice) ??
      [...children].sort((left, right) => left.order - right.order)[0]
    );
  }

  return bestChild;
}

export function buildVariantItem(
  indexes: TailoringIndexes,
  item: Item,
  order: number,
): VariantItem {
  const itemTagIds = getItemTagIds(indexes, item.id);
  const included = computeIncluded(item, itemTagIds, indexes.selectedTagIds);

  const entry: VariantItem = {
    variantId: indexes.variantId,
    itemId: item.id,
    included,
    order,
    locked: false,
  };

  if (item.isChoiceGroup) {
    const chosen = chooseAlternative(indexes, item);
    if (chosen != null) {
      entry.chosenAlternativeId = chosen.id;
    }
  }

  return entry;
}

export function sortSiblingGroup(
  indexes: TailoringIndexes,
  items: Item[],
): Item[] {
  return [...items].sort((left, right) => compareByRank(indexes, left, right));
}

export function generateOverlayEntries(
  indexes: TailoringIndexes,
): VariantItem[] {
  const entries: VariantItem[] = [];

  for (const groupItems of indexes.siblingGroups.values()) {
    const sortedItems = sortSiblingGroup(indexes, groupItems);
    sortedItems.forEach((item, index) => {
      entries.push(buildVariantItem(indexes, item, index));
    });
  }

  return entries;
}

export function groupOverlayByParent(
  indexes: TailoringIndexes,
  overlay: VariantItem[],
): Map<string, VariantItem[]> {
  const groups = new Map<string, VariantItem[]>();

  for (const entry of overlay) {
    const item = indexes.itemMap.get(entry.itemId);
    if (item == null) {
      continue;
    }

    const parentKey = getParentKey(item);
    const group = groups.get(parentKey) ?? [];
    group.push(entry);
    groups.set(parentKey, group);
  }

  for (const group of groups.values()) {
    group.sort((left, right) => left.order - right.order);
  }

  return groups;
}

export function mergeUnlockedEntry(
  existing: VariantItem,
  fresh: VariantItem,
  order: number,
): VariantItem {
  return {
    ...fresh,
    order,
    overrideData: existing.overrideData,
    locked: false,
  };
}
