import type { Basics } from "./domain/master-resume.js";
import type { Item } from "./domain/item.js";
import type {
  RenderExperienceEntry,
  RenderModel,
  RenderSkill,
  RenderSkillGroup,
  RenderSummaryBlock,
} from "./domain/render-model.js";
import type { Section } from "./domain/section.js";
import type { SkillGroupData, TextData } from "./domain/item-data.js";
import type { VariantItem } from "./domain/variant.js";
import { mergeOverride } from "./merge-override.js";

export type BuildRenderModelInput = {
  basics: Basics;
  items: Item[];
  overlay: VariantItem[];
  templateId: string;
};

export function buildRenderModel(input: BuildRenderModelInput): RenderModel {
  const context = createRenderContext(input.items, input.overlay);

  return {
    basics: input.basics,
    templateId: input.templateId,
    summary: buildTopLevelSection(context, "summary", buildSummaryBlock),
    work: buildTopLevelSection(context, "work", buildExperienceEntry),
    education: buildTopLevelSection(context, "education", buildExperienceEntry),
    projects: buildTopLevelSection(context, "project", buildExperienceEntry),
    skillGroups: buildTopLevelSection(context, "skillGroup", buildSkillGroup),
    skills: buildTopLevelSection(context, "skill", buildSkill),
  };
}

type RenderContext = {
  itemMap: Map<string, Item>;
  overlayMap: Map<string, VariantItem>;
  childrenByParentId: Map<string, Item[]>;
};

function createRenderContext(
  items: Item[],
  overlay: VariantItem[],
): RenderContext {
  const itemMap = new Map<string, Item>();
  const overlayMap = new Map<string, VariantItem>();
  const childrenByParentId = new Map<string, Item[]>();

  for (const item of items) {
    itemMap.set(item.id, item);
    if (item.parentId != null) {
      const siblings = childrenByParentId.get(item.parentId) ?? [];
      siblings.push(item);
      childrenByParentId.set(item.parentId, siblings);
    }
  }

  for (const entry of overlay) {
    overlayMap.set(entry.itemId, entry);
  }

  return { itemMap, overlayMap, childrenByParentId };
}

function buildTopLevelSection<T>(
  context: RenderContext,
  section: Section,
  buildEntry: (context: RenderContext, item: Item) => T | null,
): T[] {
  const entries: T[] = [];

  for (const item of context.itemMap.values()) {
    if (item.section !== section || item.parentId != null) {
      continue;
    }

    const built = buildEntry(context, item);
    if (built != null) {
      entries.push(built);
    }
  }

  return entries.sort(
    (left, right) =>
      getOverlayOrder(context, (left as { id: string }).id) -
      getOverlayOrder(context, (right as { id: string }).id),
  );
}

function buildSummaryBlock(
  context: RenderContext,
  item: Item,
): RenderSummaryBlock | null {
  const overlay = context.overlayMap.get(item.id);
  if (!isIncluded(overlay)) {
    return null;
  }

  if (item.isChoiceGroup) {
    const chosen = resolveChosenAlternative(context, item, overlay);
    if (chosen == null) {
      return null;
    }

    const text = (chosen.data as TextData).text;
    return { id: item.id, text };
  }

  const data = resolveMergedData(item, overlay);
  if (
    !("text" in data) ||
    typeof data.text !== "string" ||
    data.text.length === 0
  ) {
    return null;
  }

  return { id: item.id, text: data.text };
}

function buildExperienceEntry(
  context: RenderContext,
  item: Item,
): RenderExperienceEntry | null {
  const overlay = context.overlayMap.get(item.id);
  if (!isIncluded(overlay)) {
    return null;
  }

  const data = resolveMergedData(item, overlay);

  return {
    id: item.id,
    company: readOptionalString(data, "company"),
    name: readOptionalString(data, "name"),
    position: readOptionalString(data, "position"),
    startDate: readRequiredString(data, "startDate"),
    endDate: readNullableString(data, "endDate"),
    location: readOptionalString(data, "location"),
    url: readOptionalString(data, "url"),
    bullets: buildIncludedChildren(context, item.id, "bullet"),
  };
}

function buildSkillGroup(
  context: RenderContext,
  item: Item,
): RenderSkillGroup | null {
  const overlay = context.overlayMap.get(item.id);
  if (!isIncluded(overlay)) {
    return null;
  }

  const data = resolveMergedData(item, overlay) as SkillGroupData;

  return {
    id: item.id,
    name: data.name,
    skills: buildIncludedChildren(context, item.id, "skill"),
  };
}

function buildSkill(context: RenderContext, item: Item): RenderSkill | null {
  const overlay = context.overlayMap.get(item.id);
  if (!isIncluded(overlay)) {
    return null;
  }

  const data = resolveMergedData(item, overlay) as TextData;
  return { id: item.id, text: data.text };
}

function buildIncludedChildren(
  context: RenderContext,
  parentId: string,
  section: Section,
): Array<{ id: string; text: string }> {
  const children = context.childrenByParentId.get(parentId) ?? [];

  return children
    .filter((child) => child.section === section)
    .filter((child) => isIncluded(context.overlayMap.get(child.id)))
    .sort(
      (left, right) =>
        getOverlayOrder(context, left.id) - getOverlayOrder(context, right.id),
    )
    .map((child) => {
      const overlay = context.overlayMap.get(child.id);
      const data = resolveMergedData(child, overlay) as TextData;
      return { id: child.id, text: data.text };
    });
}

function resolveChosenAlternative(
  context: RenderContext,
  parent: Item,
  overlay: VariantItem,
): Item | undefined {
  if (overlay.chosenAlternativeId != null) {
    return context.itemMap.get(overlay.chosenAlternativeId);
  }

  const children = context.childrenByParentId.get(parent.id) ?? [];
  return (
    children.find((child) => child.isDefaultChoice) ??
    children.sort((left, right) => left.order - right.order)[0]
  );
}

function resolveMergedData(
  item: Item,
  overlay: VariantItem | undefined,
): Record<string, unknown> {
  const base = item.data as Record<string, unknown>;
  if (overlay?.overrideData == null) {
    return base;
  }

  return mergeOverride(base, overlay.overrideData as Record<string, unknown>);
}

function isIncluded(overlay: VariantItem | undefined): overlay is VariantItem {
  return overlay?.included === true;
}

function getOverlayOrder(context: RenderContext, itemId: string): number {
  return context.overlayMap.get(itemId)?.order ?? Number.MAX_SAFE_INTEGER;
}

function readOptionalString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function readRequiredString(
  data: Record<string, unknown>,
  key: string,
): string {
  const value = data[key];
  if (typeof value !== "string") {
    throw new Error(`Expected "${key}" to be a string`);
  }

  return value;
}

function readNullableString(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Expected "${key}" to be a string or null`);
  }

  return value;
}
