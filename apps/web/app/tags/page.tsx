'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AppNav } from '@/components/layout/app-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [categoryKey, setCategoryKey] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [tagLabel, setTagLabel] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['tag-categories'],
    queryFn: api.listTagCategories,
  });

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.listTags(),
  });

  const createCategoryMutation = useMutation({
    mutationFn: () =>
      api.createTagCategory({ key: categoryKey, name: categoryName }),
    onSuccess: () => {
      setCategoryKey('');
      setCategoryName('');
      void queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: () =>
      api.createTag({ label: tagLabel, categoryId: selectedCategoryId }),
    onSuccess: () => {
      setTagLabel('');
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: api.deleteTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: api.deleteTagCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const categories = categoriesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  return (
    <div>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Manage tag categories and labels used for tailoring.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.key}
                        {category.isDefault ? ' · default' : ''}
                      </p>
                    </div>
                    {!category.isDefault ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteCategoryMutation.mutate(category.id)
                        }
                      >
                        Delete
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t pt-4">
                <Label>New category</Label>
                <Input
                  placeholder="key"
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value)}
                />
                <Input
                  placeholder="Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <Button
                  onClick={() => createCategoryMutation.mutate()}
                  disabled={!categoryKey || !categoryName}
                >
                  Add category
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tags.map((tag) => {
                  const category = categories.find(
                    (c) => c.id === tag.categoryId,
                  );
                  return (
                    <li
                      key={tag.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{tag.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {category?.name ?? tag.categoryId}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTagMutation.mutate(tag.id)}
                      >
                        Delete
                      </Button>
                    </li>
                  );
                })}
              </ul>
              <div className="space-y-2 border-t pt-4">
                <Label>New tag</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Label"
                  value={tagLabel}
                  onChange={(e) => setTagLabel(e.target.value)}
                />
                <Button
                  onClick={() => createTagMutation.mutate()}
                  disabled={!tagLabel || !selectedCategoryId}
                >
                  Add tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
