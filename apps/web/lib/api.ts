import type {
  MasterResumeGet,
  MasterResumePut,
  Tag,
  TagCategory,
  TagCategoryCreate,
  TagCategoryPatch,
  TagCreate,
  TagPatch,
  VariantCreate,
  VariantGet,
  VariantListItem,
  VariantPut,
} from '@repo/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getMaster: () => request<MasterResumeGet>('/master'),
  putMaster: (body: MasterResumePut) =>
    request<MasterResumeGet>('/master', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  listVariants: () => request<VariantListItem[]>('/variants'),
  createVariant: (body: VariantCreate) =>
    request<VariantGet>('/variants', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getVariant: (id: string) => request<VariantGet>(`/variants/${id}`),
  putVariant: (id: string, body: VariantPut) =>
    request<VariantGet>(`/variants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteVariant: (id: string) =>
    request<void>(`/variants/${id}`, { method: 'DELETE' }),

  listTagCategories: () => request<TagCategory[]>('/tag-categories'),
  createTagCategory: (body: TagCategoryCreate) =>
    request<TagCategory>('/tag-categories', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patchTagCategory: (id: string, body: TagCategoryPatch) =>
    request<TagCategory>(`/tag-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteTagCategory: (id: string) =>
    request<void>(`/tag-categories/${id}`, { method: 'DELETE' }),

  listTags: (categoryId?: string) =>
    request<Tag[]>(
      categoryId != null ? `/tags?categoryId=${categoryId}` : '/tags',
    ),
  createTag: (body: TagCreate) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify(body) }),
  patchTag: (id: string, body: TagPatch) =>
    request<Tag>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteTag: (id: string) => request<void>(`/tags/${id}`, { method: 'DELETE' }),

  exportVariantPdf: async (id: string, templateId?: string) => {
    const response = await fetch(`${apiUrl}/variants/${id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'pdf', templateId }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.blob();
  },
};
