'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { Tag, WireItem } from '@repo/shared';
import { AppNav } from '@/components/layout/app-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toMasterPut, useMasterStore } from '@/stores/master-store';

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

function itemLabel(item: WireItem): string {
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

export default function MasterPage() {
  const queryClient = useQueryClient();
  const store = useMasterStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const masterQuery = useQuery({
    queryKey: ['master'],
    queryFn: api.getMaster,
  });

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.listTags(),
  });

  const saveMutation = useMutation({
    mutationFn: api.putMaster,
    onSuccess: (data) => {
      store.markClean(data);
      void queryClient.invalidateQueries({ queryKey: ['master'] });
      setSaveMessage('Saved');
      setTimeout(() => setSaveMessage(null), 2000);
    },
    onError: (error: Error) => setSaveMessage(error.message),
  });

  useEffect(() => {
    if (masterQuery.data != null) {
      store.load(masterQuery.data);
    }
  }, [masterQuery.data, store]);

  const topLevelItems = store.items.filter((item) => item.parentId == null);
  const tags = tagsQuery.data ?? [];

  const addWork = () => {
    const id = newId();
    store.addItem({
      id,
      section: 'work',
      parentId: null,
      isChoiceGroup: false,
      isDefaultChoice: false,
      pinned: false,
      data: {
        company: 'New Company',
        position: 'Role',
        startDate: '2024-01',
        endDate: null,
      },
      order: topLevelItems.filter((i) => i.section === 'work').length,
    });
  };

  const addBullet = (parentId: string) => {
    store.addItem({
      id: newId(),
      section: 'bullet',
      parentId,
      isChoiceGroup: false,
      isDefaultChoice: false,
      pinned: false,
      data: { text: 'New bullet point' },
      order: store.items.filter((i) => i.parentId === parentId).length,
    });
  };

  const addSummary = () => {
    store.addItem({
      id: newId(),
      section: 'summary',
      parentId: null,
      isChoiceGroup: false,
      isDefaultChoice: false,
      pinned: false,
      data: { text: 'New summary block' },
      order: topLevelItems.filter((i) => i.section === 'summary').length,
    });
  };

  const itemTags = (itemId: string) =>
    store.itemTags.filter((t) => t.itemId === itemId).map((t) => t.tagId);

  const renderTagPicker = (itemId: string) => (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag: Tag) => {
        const active = itemTags(itemId).includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => store.toggleItemTag(itemId, tag.id)}
            className="rounded-full"
          >
            <Badge variant={active ? 'default' : 'outline'}>{tag.label}</Badge>
          </button>
        );
      })}
    </div>
  );

  if (masterQuery.isLoading) {
    return (
      <div>
        <AppNav />
        <main className="mx-auto max-w-6xl p-6">Loading master…</main>
      </div>
    );
  }

  return (
    <div>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Master Resume</h1>
            <p className="text-sm text-muted-foreground">
              Edit your canonical resume content and tags.
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
              onClick={() => saveMutation.mutate(toMasterPut(store))}
              disabled={saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={store.basics.name}
                onChange={(e) =>
                  store.setBasics({ ...store.basics, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={store.basics.label ?? ''}
                onChange={(e) =>
                  store.setBasics({ ...store.basics, label: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={store.basics.email ?? ''}
                onChange={(e) =>
                  store.setBasics({ ...store.basics, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={store.basics.phone ?? ''}
                onChange={(e) =>
                  store.setBasics({ ...store.basics, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Summary</CardTitle>
            <Button variant="outline" size="sm" onClick={addSummary}>
              Add block
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLevelItems
              .filter(
                (item) => item.section === 'summary' && !item.isChoiceGroup,
              )
              .map((item) => (
                <div key={item.id} className="space-y-2 rounded-md border p-4">
                  <Textarea
                    value={'text' in item.data ? (item.data.text ?? '') : ''}
                    onChange={(e) =>
                      store.updateItem(item.id, {
                        data: { text: e.target.value },
                      } as Partial<WireItem>)
                    }
                  />
                  {renderTagPicker(item.id)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => store.removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button variant="outline" size="sm" onClick={addWork}>
              Add work
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {topLevelItems
              .filter((item) => item.section === 'work')
              .map((work) => (
                <div key={work.id} className="space-y-3 rounded-md border p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="Company"
                      value={'company' in work.data ? work.data.company : ''}
                      onChange={(e) =>
                        store.updateItem(work.id, {
                          data: {
                            ...('company' in work.data ? work.data : {}),
                            company: e.target.value,
                          },
                        } as Partial<WireItem>)
                      }
                    />
                    <Input
                      placeholder="Position"
                      value={
                        'position' in work.data
                          ? (work.data.position ?? '')
                          : ''
                      }
                      onChange={(e) =>
                        store.updateItem(work.id, {
                          data: {
                            ...('company' in work.data ? work.data : {}),
                            position: e.target.value,
                          },
                        } as Partial<WireItem>)
                      }
                    />
                  </div>
                  {renderTagPicker(work.id)}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Bullets</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBullet(work.id)}
                      >
                        Add bullet
                      </Button>
                    </div>
                    {store.items
                      .filter((item) => item.parentId === work.id)
                      .map((bullet) => (
                        <div
                          key={bullet.id}
                          className="space-y-2 rounded border p-3"
                        >
                          <Textarea
                            value={
                              'text' in bullet.data ? bullet.data.text : ''
                            }
                            onChange={(e) =>
                              store.updateItem(bullet.id, {
                                data: { text: e.target.value },
                              } as Partial<WireItem>)
                            }
                          />
                          {renderTagPicker(bullet.id)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => store.removeItem(bullet.id)}
                          >
                            Remove bullet
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => store.removeItem(work.id)}
                  >
                    Remove work entry
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {store.items.map((item) => (
                <li key={item.id}>
                  [{item.section}] {itemLabel(item)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
