'use client';

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  buildRenderModel,
  regenerateOverlay,
  type Item,
  type Tag,
  type WireItem,
} from '@repo/shared';
import { toPersistentItems } from '@repo/shared';
import { AppNav } from '@/components/layout/app-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toVariantPut, useVariantStore } from '@/stores/variant-store';

function SortableRow({
  id,
  label,
  included,
  onToggle,
}: {
  id: string;
  label: string;
  included: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <input type="checkbox" checked={included} onChange={onToggle} />
      <span className={included ? '' : 'text-muted-foreground line-through'}>
        {label}
      </span>
    </div>
  );
}

function itemLabel(item: WireItem | Item): string {
  if ('text' in item.data && item.data.text) {
    return item.data.text.slice(0, 80);
  }
  if ('company' in item.data) {
    return `${item.data.position ?? ''} @ ${item.data.company}`.trim();
  }
  if ('name' in item.data) {
    return item.data.name;
  }
  return item.section;
}

export default function VariantEditorPage() {
  const params = useParams<{ id: string }>();
  const variantId = params.id;
  const queryClient = useQueryClient();
  const store = useVariantStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showRegenWarning, setShowRegenWarning] = useState(false);

  const variantQuery = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => api.getVariant(variantId),
  });

  const masterQuery = useQuery({
    queryKey: ['master'],
    queryFn: api.getMaster,
  });

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.listTags(),
  });

  const saveMutation = useMutation({
    mutationFn: () => api.putVariant(variantId, toVariantPut(store)),
    onSuccess: (data) => {
      store.markClean(data);
      void queryClient.invalidateQueries({ queryKey: ['variant', variantId] });
      setSaveMessage('Saved');
      setTimeout(() => setSaveMessage(null), 2000);
    },
    onError: (error: Error) => setSaveMessage(error.message),
  });

  useEffect(() => {
    if (variantQuery.data != null) {
      store.load(variantQuery.data);
    }
  }, [variantQuery.data, store]);

  const masterItems = useMemo(() => {
    if (masterQuery.data == null) return [];
    return toPersistentItems(masterQuery.data.items, masterQuery.data.id);
  }, [masterQuery.data]);

  const overlayItemIds = store.items
    .filter((item) => item.included)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.itemId);

  const renderModel = useMemo(() => {
    if (masterQuery.data == null || masterItems.length === 0) return null;
    try {
      return buildRenderModel({
        basics: masterQuery.data.basics,
        items: masterItems,
        overlay: store.items.map((item) => ({
          ...item,
          variantId,
        })),
        templateId: store.templateId,
      });
    } catch {
      return null;
    }
  }, [masterQuery.data, masterItems, store.items, store.templateId, variantId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleTag = (tagId: string) => {
    const exists = store.tags.find((tag) => tag.tagId === tagId);
    if (exists != null) {
      store.setTags(store.tags.filter((tag) => tag.tagId !== tagId));
      return;
    }
    const maxPriority = store.tags.reduce(
      (max, tag) => Math.max(max, tag.priority),
      -1,
    );
    store.setTags([...store.tags, { tagId, priority: maxPriority + 1 }]);
  };

  const applyTags = () => {
    if (masterQuery.data == null) return;
    const selectedTagIds = [...store.tags]
      .sort((a, b) => a.priority - b.priority)
      .map((tag) => tag.tagId);

    const regenerated = regenerateOverlay({
      variantId,
      items: masterItems,
      itemTags: masterQuery.data.itemTags,
      selectedTagIds,
      existingOverlay: store.items.map((item) => ({
        ...item,
        variantId,
      })),
    });

    store.setItems(
      regenerated.map((item) => ({
        itemId: item.itemId,
        included: item.included,
        order: item.order,
        overrideData: item.overrideData,
        chosenAlternativeId: item.chosenAlternativeId,
        locked: item.locked,
      })),
    );
    setShowRegenWarning(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;

    const oldIndex = overlayItemIds.indexOf(String(active.id));
    const newIndex = overlayItemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(overlayItemIds, oldIndex, newIndex);
    const nextItems = store.items.map((item) => {
      const idx = reordered.indexOf(item.itemId);
      if (idx < 0) return item;
      return { ...item, order: idx, locked: true };
    });
    store.setItems(nextItems);
  };

  if (variantQuery.isLoading || masterQuery.isLoading) {
    return (
      <div>
        <AppNav />
        <main className="mx-auto max-w-6xl p-6">Loading…</main>
      </div>
    );
  }

  const allTags = tagsQuery.data ?? [];

  return (
    <div>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Variant Editor</h1>
            <p className="text-sm text-muted-foreground">
              Tailor content with tags, then fine-tune manually.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {store.dirty ? (
              <span className="text-sm text-amber-600">Unsaved changes</span>
            ) : null}
            {saveMessage ? (
              <span className="text-sm text-muted-foreground">
                {saveMessage}
              </span>
            ) : null}
            <Button
              variant="outline"
              onClick={async () => {
                const blob = await api.exportVariantPdf(
                  variantId,
                  store.templateId,
                );
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `${store.name || 'resume'}.pdf`;
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export PDF
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={store.name}
                    onChange={(e) => store.setMeta({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target company</Label>
                  <Input
                    value={store.targetCompany ?? ''}
                    onChange={(e) =>
                      store.setMeta({
                        targetCompany: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job description</Label>
                  <Textarea
                    value={store.jobDescription ?? ''}
                    onChange={(e) =>
                      store.setMeta({
                        jobDescription: e.target.value || null,
                      })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={store.isFavorite}
                    onChange={(e) =>
                      store.setMeta({ isFavorite: e.target.checked })
                    }
                  />
                  Favorite
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Job tags</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegenWarning(true)}
                >
                  Apply tags
                </Button>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {allTags.map((tag: Tag) => {
                  const selected = store.tags.some((t) => t.tagId === tag.id);
                  const priority = store.tags.find(
                    (t) => t.tagId === tag.id,
                  )?.priority;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                    >
                      <Badge variant={selected ? 'default' : 'outline'}>
                        {tag.label}
                        {priority != null ? ` (#${priority + 1})` : ''}
                      </Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overlay items</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={overlayItemIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {overlayItemIds.map((itemId) => {
                        const masterItem = masterQuery.data?.items.find(
                          (item) => item.id === itemId,
                        );
                        const overlay = store.items.find(
                          (item) => item.itemId === itemId,
                        );
                        if (masterItem == null || overlay == null) return null;
                        return (
                          <SortableRow
                            key={itemId}
                            id={itemId}
                            label={itemLabel(masterItem)}
                            included={overlay.included}
                            onToggle={() =>
                              store.updateItem(itemId, {
                                included: !overlay.included,
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              {renderModel == null ? (
                <p className="text-muted-foreground">Preview unavailable</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {renderModel.basics.name}
                    </h2>
                    {renderModel.basics.label ? (
                      <p className="text-muted-foreground">
                        {renderModel.basics.label}
                      </p>
                    ) : null}
                  </div>
                  {renderModel.summary.length > 0 ? (
                    <section>
                      <h3 className="font-semibold">Summary</h3>
                      {renderModel.summary.map((block) => (
                        <p key={block.id}>{block.text}</p>
                      ))}
                    </section>
                  ) : null}
                  {renderModel.work.length > 0 ? (
                    <section>
                      <h3 className="font-semibold">Experience</h3>
                      {renderModel.work.map((entry) => (
                        <div key={entry.id} className="mb-3">
                          <p className="font-medium">
                            {entry.position} @ {entry.company}
                          </p>
                          <ul className="list-disc pl-5">
                            {entry.bullets.map((bullet) => (
                              <li key={bullet.id}>{bullet.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  ) : null}
                  {renderModel.skillGroups.length > 0 ||
                  renderModel.skills.length > 0 ? (
                    <section>
                      <h3 className="font-semibold">Skills</h3>
                      {renderModel.skillGroups.map((group) => (
                        <p key={group.id}>
                          {group.name}:{' '}
                          {group.skills.map((skill) => skill.text).join(', ')}
                        </p>
                      ))}
                      {renderModel.skills.length > 0 ? (
                        <p>
                          {renderModel.skills
                            .map((skill) => skill.text)
                            .join(', ')}
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showRegenWarning ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Regenerate overlay?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will regenerate the overlay from selected tags. Locked
                  items will be preserved.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRegenWarning(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={applyTags}>Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
