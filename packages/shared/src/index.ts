export {
  dateStringSchema,
  entityIdSchema,
  timestampSchema,
  type DeepPartial,
  type EntityId,
} from './domain/common.js';

export { sectionSchema, type Section } from './domain/section.js';

export {
  educationDataOverrideSchema,
  educationDataSchema,
  emptyDataSchema,
  projectDataSchema,
  projectDataOverrideSchema,
  skillGroupDataOverrideSchema,
  skillGroupDataSchema,
  textDataOverrideSchema,
  textDataSchema,
  workDataOverrideSchema,
  workDataSchema,
  type EducationData,
  type EmptyData,
  type ItemData,
  type ProjectData,
  type SkillGroupData,
  type TextData,
  type WorkData,
} from './domain/item-data.js';

export {
  itemSchema,
  itemTagSchema,
  type Item,
  type ItemTag,
} from './domain/item.js';

export {
  tagCategorySchema,
  tagSchema,
  type Tag,
  type TagCategory,
} from './domain/tag.js';

export {
  basicsLocationSchema,
  basicsProfileSchema,
  basicsSchema,
  masterResumePayloadSchema,
  masterResumeSchema,
  type Basics,
  type MasterResume,
  type MasterResumePayload,
} from './domain/master-resume.js';

export {
  masterResumeGetSchema,
  masterResumePutSchema,
  wireItemSchema,
  type MasterResumeGet,
  type MasterResumePut,
  type WireItem,
} from './domain/wire.js';

export {
  toMasterResumeGet,
  toPersistentItem,
  toPersistentItems,
  toWireItem,
} from './mappers/master.js';

export {
  assertValidMasterResumePayload,
  assertValidMasterResumePut,
  assertValidVariantPayload,
  validateItemTags,
  validateItems,
  validateMasterResumePayload,
  validateMasterResumePut,
  validateVariantOverlay,
  validateVariantPayload,
  type ValidationIssue,
} from './validate-domain.js';

export {
  overrideDataSchema,
  variantItemSchema,
  variantPayloadSchema,
  variantSchema,
  variantTagSchema,
  type Variant,
  type VariantItem,
  type VariantPayload,
  type VariantTag,
} from './domain/variant.js';

export { mergeOverride } from './merge-override.js';

export {
  buildRenderModel,
  type BuildRenderModelInput,
} from './build-render-model.js';

export {
  addTagSoft,
  buildTailoringIndexes,
  buildVariantItem,
  chooseAlternative,
  compareByRank,
  computeIncluded,
  computeRank,
  generateOverlay,
  generateOverlayEntries,
  getItemTagIds,
  getParentKey,
  isOverlayEligible,
  regenerateOverlay,
  removeTagSoft,
  sortSiblingGroup,
  type AddTagSoftInput,
  type RegenerateOverlayInput,
  type RemoveTagSoftInput,
  type TagSoftResult,
  type TailoringContext,
  type TailoringIndexes,
} from './tailoring/index.js';

export {
  renderBulletSchema,
  renderExperienceEntrySchema,
  renderModelSchema,
  renderSkillGroupSchema,
  renderSkillSchema,
  renderSummaryBlockSchema,
  type RenderBullet,
  type RenderExperienceEntry,
  type RenderModel,
  type RenderSkill,
  type RenderSkillGroup,
  type RenderSummaryBlock,
} from './domain/render-model.js';
