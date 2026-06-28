import type { Basics } from "../domain/master-resume.js";
import type { Item, ItemTag } from "../domain/item.js";
import type { VariantItem, VariantTag } from "../domain/variant.js";

export const DEMO_VARIANT_ID = "var_google";
export const DEMO_MASTER_ID = "master_demo";

export const demoBasics: Basics = {
  name: "Alex Ivanov",
  label: "Fullstack Engineer",
  email: "alex@example.com",
};

export const demoItems: Item[] = [
  {
    id: "sum_intro",
    masterId: DEMO_MASTER_ID,
    section: "summary",
    parentId: null,
    isChoiceGroup: true,
    pinned: true,
    isDefaultChoice: false,
    data: {},
    order: 0,
  },
  {
    id: "sum_intro_fs",
    masterId: DEMO_MASTER_ID,
    section: "summary",
    parentId: "sum_intro",
    isDefaultChoice: true,
    isChoiceGroup: false,
    pinned: false,
    data: {
      text: "Fullstack engineer with 6+ years building product-focused web apps end-to-end.",
    },
    order: 0,
  },
  {
    id: "sum_intro_fe",
    masterId: DEMO_MASTER_ID,
    section: "summary",
    parentId: "sum_intro",
    isDefaultChoice: false,
    isChoiceGroup: false,
    pinned: false,
    data: {
      text: "Frontend engineer focused on UX, performance and design-system work.",
    },
    order: 1,
  },
  {
    id: "sum_spain",
    masterId: DEMO_MASTER_ID,
    section: "summary",
    parentId: null,
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: { text: "EU/Spain work permit, based in Barcelona." },
    order: 1,
  },
  {
    id: "work_acme",
    masterId: DEMO_MASTER_ID,
    section: "work",
    parentId: null,
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: {
      company: "Acme",
      position: "Senior Software Engineer",
      startDate: "2021-03",
      endDate: null,
      location: "Remote",
    },
    order: 0,
  },
  {
    id: "blt_acme_perf",
    masterId: DEMO_MASTER_ID,
    section: "bullet",
    parentId: "work_acme",
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: {
      text: "Cut API p95 latency by 40% via query optimization and caching.",
    },
    order: 0,
  },
  {
    id: "blt_acme_team",
    masterId: DEMO_MASTER_ID,
    section: "bullet",
    parentId: "work_acme",
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: {
      text: "Led a team of 4 engineers, owning the checkout domain end-to-end.",
    },
    order: 1,
  },
  {
    id: "skg_frontend",
    masterId: DEMO_MASTER_ID,
    section: "skillGroup",
    parentId: null,
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: { name: "Frontend" },
    order: 0,
  },
  {
    id: "skill_react",
    masterId: DEMO_MASTER_ID,
    section: "skill",
    parentId: "skg_frontend",
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: { text: "React" },
    order: 0,
  },
  {
    id: "skill_vue",
    masterId: DEMO_MASTER_ID,
    section: "skill",
    parentId: "skg_frontend",
    isChoiceGroup: false,
    isDefaultChoice: false,
    pinned: false,
    data: { text: "Vue" },
    order: 1,
  },
];

export const demoItemTags: ItemTag[] = [
  { itemId: "skill_react", tagId: "tag_react" },
  { itemId: "skill_vue", tagId: "tag_vue" },
  { itemId: "blt_acme_perf", tagId: "tag_optimization" },
  { itemId: "blt_acme_team", tagId: "tag_ownership" },
  { itemId: "blt_acme_team", tagId: "tag_teamwork" },
  { itemId: "sum_spain", tagId: "tag_spain" },
];

export const demoVariantTags: VariantTag[] = [
  { variantId: DEMO_VARIANT_ID, tagId: "tag_optimization", priority: 0 },
  { variantId: DEMO_VARIANT_ID, tagId: "tag_ownership", priority: 1 },
  { variantId: DEMO_VARIANT_ID, tagId: "tag_react", priority: 2 },
];

export const demoSelectedTagIds = demoVariantTags
  .sort((left, right) => left.priority - right.priority)
  .map((tag) => tag.tagId);

export const demoOverlay: VariantItem[] = [
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "sum_intro",
    included: true,
    order: 0,
    chosenAlternativeId: "sum_intro_fe",
    locked: true,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "sum_spain",
    included: false,
    order: 1,
    locked: false,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "work_acme",
    included: true,
    order: 0,
    locked: false,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "blt_acme_perf",
    included: true,
    order: 0,
    overrideData: {
      text: "Reduced API p95 latency by 40% (Node/Postgres).",
    },
    locked: true,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "blt_acme_team",
    included: true,
    order: 1,
    locked: false,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "skg_frontend",
    included: true,
    order: 0,
    locked: false,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "skill_react",
    included: true,
    order: 0,
    locked: false,
  },
  {
    variantId: DEMO_VARIANT_ID,
    itemId: "skill_vue",
    included: true,
    order: 1,
    locked: false,
  },
];

export function overlayEntry(itemId: string): VariantItem | undefined {
  return demoOverlay.find((entry) => entry.itemId === itemId);
}
