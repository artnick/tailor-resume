import { describe, expect, it } from "vitest";

import { buildRenderModel } from "./build-render-model.js";
import { mergeOverride } from "./merge-override.js";
import {
  addTagSoft,
  generateOverlay,
  regenerateOverlay,
  removeTagSoft,
} from "./tailoring/index.js";
import {
  validateItems,
  validateMasterResumePayload,
  validateVariantOverlay,
} from "./validate-domain.js";
import {
  demoBasics,
  demoItemTags,
  demoItems,
  demoOverlay,
  demoSelectedTagIds,
  demoVariantTags,
  DEMO_MASTER_ID,
  DEMO_VARIANT_ID,
} from "./test-fixtures/demo-master.js";

describe("mergeOverride", () => {
  it("returns base data when override is empty", () => {
    expect(mergeOverride({ text: "Original" }, undefined)).toEqual({
      text: "Original",
    });
  });

  it("merges partial override fields", () => {
    expect(
      mergeOverride(
        {
          company: "Acme",
          position: "Senior SWE",
          startDate: "2021-03",
          endDate: null,
        },
        { position: "Staff Engineer" },
      ),
    ).toEqual({
      company: "Acme",
      position: "Staff Engineer",
      startDate: "2021-03",
      endDate: null,
    });
  });
});

describe("generateOverlay", () => {
  it("sorts bullets by selected tag priority", () => {
    const overlay = generateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: demoSelectedTagIds,
    });

    const perf = overlay.find((entry) => entry.itemId === "blt_acme_perf");
    const team = overlay.find((entry) => entry.itemId === "blt_acme_team");

    expect(perf?.included).toBe(true);
    expect(team?.included).toBe(true);
    expect(perf?.order).toBe(0);
    expect(team?.order).toBe(1);
  });

  it("excludes tagged items without matching selected tags", () => {
    const overlay = generateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: ["tag_optimization", "tag_ownership", "tag_react"],
    });

    expect(
      overlay.find((entry) => entry.itemId === "sum_spain")?.included,
    ).toBe(false);
  });

  it("chooses the best alternative for choice groups", () => {
    const overlay = generateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: [
        ...demoItemTags,
        { itemId: "sum_intro_fe", tagId: "tag_react" },
      ],
      selectedTagIds: ["tag_react"],
    });

    expect(
      overlay.find((entry) => entry.itemId === "sum_intro")
        ?.chosenAlternativeId,
    ).toBe("sum_intro_fe");
  });

  it("does not create overlay rows for choice-group children", () => {
    const overlay = generateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: demoSelectedTagIds,
    });

    expect(overlay.some((entry) => entry.itemId === "sum_intro_fs")).toBe(
      false,
    );
    expect(overlay.some((entry) => entry.itemId === "sum_intro_fe")).toBe(
      false,
    );
  });
});

describe("regenerateOverlay", () => {
  it("preserves locked rows during regen", () => {
    const regenerated = regenerateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: demoSelectedTagIds,
      existingOverlay: demoOverlay,
    });

    const intro = regenerated.find((entry) => entry.itemId === "sum_intro");
    const perf = regenerated.find((entry) => entry.itemId === "blt_acme_perf");

    expect(intro).toEqual(
      demoOverlay.find((entry) => entry.itemId === "sum_intro"),
    );
    expect(perf).toEqual(
      demoOverlay.find((entry) => entry.itemId === "blt_acme_perf"),
    );
  });
});

describe("addTagSoft", () => {
  it("activates newly matching items without reordering existing rows", () => {
    const baseOverlay = generateOverlay({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: ["tag_optimization", "tag_ownership", "tag_react"],
    });

    const { tags, overlay } = addTagSoft({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: ["tag_optimization", "tag_ownership", "tag_react"],
      existingTags: demoVariantTags.filter((tag) => tag.tagId !== "tag_spain"),
      existingOverlay: baseOverlay,
      newTagId: "tag_spain",
    });

    expect(tags.map((tag) => tag.tagId)).toContain("tag_spain");
    expect(
      overlay.find((entry) => entry.itemId === "sum_spain")?.included,
    ).toBe(true);
    expect(
      overlay.find((entry) => entry.itemId === "blt_acme_perf")?.order,
    ).toBe(0);
  });
});

describe("removeTagSoft", () => {
  it("drops unlocked inactive items but keeps locked rows", () => {
    const { overlay } = removeTagSoft({
      variantId: DEMO_VARIANT_ID,
      items: demoItems,
      itemTags: demoItemTags,
      selectedTagIds: demoSelectedTagIds,
      existingTags: demoVariantTags,
      existingOverlay: demoOverlay,
      tagIdToRemove: "tag_react",
    });

    expect(overlay.some((entry) => entry.itemId === "skill_react")).toBe(false);
    expect(overlay.some((entry) => entry.itemId === "sum_intro")).toBe(true);
    expect(overlay.some((entry) => entry.itemId === "blt_acme_perf")).toBe(
      true,
    );
  });
});

describe("buildRenderModel", () => {
  it("builds a variant view from master and overlay", () => {
    const model = buildRenderModel({
      basics: demoBasics,
      items: demoItems,
      overlay: demoOverlay,
      templateId: "classic",
    });

    expect(model.summary).toHaveLength(1);
    expect(model.summary[0]?.text).toContain("Frontend engineer");
    expect(model.work[0]?.bullets[0]?.text).toBe(
      "Reduced API p95 latency by 40% (Node/Postgres).",
    );
    expect(model.skillGroups[0]?.skills.map((skill) => skill.text)).toEqual([
      "React",
      "Vue",
    ]);
  });
});

describe("validate domain", () => {
  it("accepts the demo master payload", () => {
    expect(
      validateMasterResumePayload({
        basics: demoBasics,
        items: demoItems,
        itemTags: demoItemTags,
      }),
    ).toEqual([]);
  });

  it("flags invalid choice groups", () => {
    const issues = validateItems([
      {
        ...demoItems[0]!,
        id: "bad_group",
        isChoiceGroup: true,
      },
      {
        id: "alt_a",
        masterId: DEMO_MASTER_ID,
        section: "summary",
        parentId: "bad_group",
        isDefaultChoice: true,
        isChoiceGroup: false,
        pinned: false,
        data: { text: "A" },
        order: 0,
      },
      {
        id: "alt_b",
        masterId: DEMO_MASTER_ID,
        section: "summary",
        parentId: "bad_group",
        isDefaultChoice: true,
        isChoiceGroup: false,
        pinned: false,
        data: { text: "B" },
        order: 1,
      },
    ]);

    expect(
      issues.some((issue) => issue.code === "choice_group_default_count"),
    ).toBe(true);
  });

  it("flags overlay rows on choice-group children", () => {
    const issues = validateVariantOverlay(demoItems, [
      {
        variantId: DEMO_VARIANT_ID,
        itemId: "sum_intro_fe",
        included: true,
        order: 0,
        locked: false,
      },
    ]);

    expect(
      issues.some((issue) => issue.code === "overlay_ineligible_item"),
    ).toBe(true);
  });
});
