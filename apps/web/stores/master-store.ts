import type {
  Basics,
  ItemTag,
  MasterResumeGet,
  MasterResumePut,
  WireItem,
} from '@repo/shared';
import { create } from 'zustand';

type MasterState = {
  masterId: string | null;
  updatedAt: string | null;
  basics: Basics;
  items: WireItem[];
  itemTags: ItemTag[];
  dirty: boolean;
  load: (data: MasterResumeGet) => void;
  setBasics: (basics: Basics) => void;
  updateItem: (id: string, patch: Partial<WireItem>) => void;
  addItem: (item: WireItem) => void;
  removeItem: (id: string) => void;
  toggleItemTag: (itemId: string, tagId: string) => void;
  markClean: (data: MasterResumeGet) => void;
};

export const useMasterStore = create<MasterState>((set) => ({
  masterId: null,
  updatedAt: null,
  basics: { name: '' },
  items: [],
  itemTags: [],
  dirty: false,

  load: (data) =>
    set({
      masterId: data.id,
      updatedAt:
        data.updatedAt instanceof Date
          ? data.updatedAt.toISOString()
          : String(data.updatedAt),
      basics: data.basics,
      items: data.items,
      itemTags: data.itemTags,
      dirty: false,
    }),

  setBasics: (basics) => set({ basics, dirty: true }),

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? ({ ...item, ...patch } as WireItem) : item,
      ),
      dirty: true,
    })),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      dirty: true,
    })),

  removeItem: (id) =>
    set((state) => {
      const removeIds = new Set<string>([id]);
      const collect = (parentId: string) => {
        for (const item of state.items) {
          if (item.parentId === parentId) {
            removeIds.add(item.id);
            collect(item.id);
          }
        }
      };
      collect(id);

      return {
        items: state.items.filter((item) => !removeIds.has(item.id)),
        itemTags: state.itemTags.filter((tag) => !removeIds.has(tag.itemId)),
        dirty: true,
      };
    }),

  toggleItemTag: (itemId, tagId) =>
    set((state) => {
      const exists = state.itemTags.some(
        (tag) => tag.itemId === itemId && tag.tagId === tagId,
      );
      return {
        itemTags: exists
          ? state.itemTags.filter(
              (tag) => !(tag.itemId === itemId && tag.tagId === tagId),
            )
          : [...state.itemTags, { itemId, tagId }],
        dirty: true,
      };
    }),

  markClean: (data) =>
    set({
      masterId: data.id,
      updatedAt:
        data.updatedAt instanceof Date
          ? data.updatedAt.toISOString()
          : String(data.updatedAt),
      dirty: false,
    }),
}));

export function toMasterPut(state: MasterState): MasterResumePut {
  return {
    basics: state.basics,
    items: state.items,
    itemTags: state.itemTags,
    updatedAt: state.updatedAt != null ? new Date(state.updatedAt) : undefined,
  };
}
