export {
  addTagSoft,
  removeTagSoft,
  type AddTagSoftInput,
  type RemoveTagSoftInput,
  type TagSoftResult,
} from './tag-operations.js';

export {
  generateOverlay,
  regenerateOverlay,
  type RegenerateOverlayInput,
} from './generate-overlay.js';

export {
  buildTailoringIndexes,
  buildVariantItem,
  chooseAlternative,
  compareByRank,
  computeIncluded,
  computeRank,
  generateOverlayEntries,
  getItemTagIds,
  getParentKey,
  isOverlayEligible,
  sortSiblingGroup,
  type TailoringContext,
  type TailoringIndexes,
} from './utils.js';
