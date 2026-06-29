import type {
  VariantGet,
  VariantPut,
  WireVariantItem,
  WireVariantTag,
} from '@repo/shared';
import { create } from 'zustand';

type VariantState = {
  variantId: string | null;
  updatedAt: string | null;
  name: string;
  isFavorite: boolean;
  templateId: string;
  baseVariantId: string | null;
  targetCompany: string | null;
  jobDescription: string | null;
  tags: WireVariantTag[];
  items: WireVariantItem[];
  dirty: boolean;
  load: (data: VariantGet) => void;
  setMeta: (
    patch: Partial<
      Pick<
        VariantState,
        'name' | 'isFavorite' | 'targetCompany' | 'jobDescription'
      >
    >,
  ) => void;
  setTags: (tags: WireVariantTag[]) => void;
  updateItem: (itemId: string, patch: Partial<WireVariantItem>) => void;
  setItems: (items: WireVariantItem[]) => void;
  markClean: (data: VariantGet) => void;
};

export const useVariantStore = create<VariantState>((set) => ({
  variantId: null,
  updatedAt: null,
  name: '',
  isFavorite: false,
  templateId: 'classic',
  baseVariantId: null,
  targetCompany: null,
  jobDescription: null,
  tags: [],
  items: [],
  dirty: false,

  load: (data) =>
    set({
      variantId: data.variant.id,
      updatedAt: data.variant.updatedAt
        ? data.variant.updatedAt instanceof Date
          ? data.variant.updatedAt.toISOString()
          : String(data.variant.updatedAt)
        : null,
      name: data.variant.name,
      isFavorite: data.variant.isFavorite,
      templateId: data.variant.templateId,
      baseVariantId: data.variant.baseVariantId ?? null,
      targetCompany: data.variant.targetCompany ?? null,
      jobDescription: data.variant.jobDescription ?? null,
      tags: data.tags,
      items: data.items,
      dirty: false,
    }),

  setMeta: (patch) => set({ ...patch, dirty: true }),

  setTags: (tags) => set({ tags, dirty: true }),

  updateItem: (itemId, patch) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId
          ? { ...item, ...patch, locked: patch.locked ?? true }
          : item,
      ),
      dirty: true,
    })),

  setItems: (items) => set({ items, dirty: true }),

  markClean: (data) =>
    set({
      updatedAt: data.variant.updatedAt
        ? data.variant.updatedAt instanceof Date
          ? data.variant.updatedAt.toISOString()
          : String(data.variant.updatedAt)
        : null,
      dirty: false,
    }),
}));

export function toVariantPut(state: VariantState): VariantPut {
  return {
    name: state.name,
    isFavorite: state.isFavorite,
    templateId: state.templateId,
    baseVariantId: state.baseVariantId,
    targetCompany: state.targetCompany,
    jobDescription: state.jobDescription,
    tags: state.tags,
    items: state.items,
    updatedAt: state.updatedAt != null ? new Date(state.updatedAt) : undefined,
  };
}
