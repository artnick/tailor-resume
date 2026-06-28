import type { Item, ItemTag } from "./domain/item.js";
import type { MasterResumePayload } from "./domain/master-resume.js";
import type { VariantItem, VariantPayload } from "./domain/variant.js";
import { isOverlayEligible } from "./tailoring/utils.js";

export type ValidationIssue = {
  code: string;
  message: string;
  path?: string;
  itemId?: string;
};

export function validateItems(items: Item[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const childrenByParentId = new Map<string, Item[]>();

  for (const item of items) {
    if (item.parentId != null && !itemMap.has(item.parentId)) {
      issues.push({
        code: "invalid_parent",
        message: `Item "${item.id}" references missing parent "${item.parentId}"`,
        itemId: item.id,
        path: `items.${item.id}.parentId`,
      });
    }

    if (item.parentId != null) {
      const siblings = childrenByParentId.get(item.parentId) ?? [];
      siblings.push(item);
      childrenByParentId.set(item.parentId, siblings);
    }
  }

  for (const item of items) {
    if (!item.isChoiceGroup) {
      continue;
    }

    const children = childrenByParentId.get(item.id) ?? [];
    const defaultChoices = children.filter((child) => child.isDefaultChoice);

    if (defaultChoices.length !== 1) {
      issues.push({
        code: "choice_group_default_count",
        message: `Choice group "${item.id}" must have exactly one default choice, found ${defaultChoices.length}`,
        itemId: item.id,
        path: `items.${item.id}.isChoiceGroup`,
      });
    }

    if (children.length === 0) {
      issues.push({
        code: "choice_group_empty",
        message: `Choice group "${item.id}" must have at least one child`,
        itemId: item.id,
        path: `items.${item.id}.isChoiceGroup`,
      });
    }
  }

  for (const item of items) {
    if (item.isDefaultChoice && item.parentId == null) {
      issues.push({
        code: "default_choice_without_parent",
        message: `Item "${item.id}" is marked as default choice but has no parent`,
        itemId: item.id,
        path: `items.${item.id}.isDefaultChoice`,
      });
      continue;
    }

    if (!item.isDefaultChoice || item.parentId == null) {
      continue;
    }

    const parent = itemMap.get(item.parentId);
    if (parent != null && !parent.isChoiceGroup) {
      issues.push({
        code: "default_choice_invalid_parent",
        message: `Item "${item.id}" is a default choice but parent "${item.parentId}" is not a choice group`,
        itemId: item.id,
        path: `items.${item.id}.isDefaultChoice`,
      });
    }
  }

  return issues;
}

export function validateItemTags(
  items: Item[],
  itemTags: ItemTag[],
): ValidationIssue[] {
  const itemIds = new Set(items.map((item) => item.id));
  const issues: ValidationIssue[] = [];

  for (const itemTag of itemTags) {
    if (!itemIds.has(itemTag.itemId)) {
      issues.push({
        code: "item_tag_unknown_item",
        message: `ItemTag references missing item "${itemTag.itemId}"`,
        itemId: itemTag.itemId,
        path: `itemTags.${itemTag.itemId}:${itemTag.tagId}`,
      });
    }
  }

  return issues;
}

export function validateVariantOverlay(
  items: Item[],
  overlay: VariantItem[],
): ValidationIssue[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const issues: ValidationIssue[] = [];

  for (const entry of overlay) {
    const item = itemMap.get(entry.itemId);
    if (item == null) {
      issues.push({
        code: "overlay_unknown_item",
        message: `Overlay references missing item "${entry.itemId}"`,
        itemId: entry.itemId,
        path: `overlay.${entry.itemId}`,
      });
      continue;
    }

    if (!isOverlayEligible(item, itemMap)) {
      issues.push({
        code: "overlay_ineligible_item",
        message: `Choice group child "${entry.itemId}" must not have an overlay row`,
        itemId: entry.itemId,
        path: `overlay.${entry.itemId}`,
      });
    }

    if (!item.isChoiceGroup || entry.chosenAlternativeId == null) {
      continue;
    }

    const children = items.filter((child) => child.parentId === item.id);
    const chosenExists = children.some(
      (child) => child.id === entry.chosenAlternativeId,
    );

    if (!chosenExists) {
      issues.push({
        code: "overlay_invalid_alternative",
        message: `Overlay for "${entry.itemId}" references unknown alternative "${entry.chosenAlternativeId}"`,
        itemId: entry.itemId,
        path: `overlay.${entry.itemId}.chosenAlternativeId`,
      });
    }
  }

  return issues;
}

export function validateMasterResumePayload(
  payload: MasterResumePayload,
): ValidationIssue[] {
  return [
    ...validateItems(payload.items),
    ...validateItemTags(payload.items, payload.itemTags),
  ];
}

export function validateVariantPayload(
  items: Item[],
  payload: VariantPayload,
): ValidationIssue[] {
  return validateVariantOverlay(items, payload.items);
}

export function assertValidMasterResumePayload(
  payload: MasterResumePayload,
): void {
  const issues = validateMasterResumePayload(payload);
  if (issues.length > 0) {
    throw new Error(formatValidationIssues(issues));
  }
}

export function assertValidVariantPayload(
  items: Item[],
  payload: VariantPayload,
): void {
  const issues = validateVariantPayload(items, payload);
  if (issues.length > 0) {
    throw new Error(formatValidationIssues(issues));
  }
}

function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => issue.message).join("; ");
}
