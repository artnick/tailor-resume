import type { Item } from '../domain/item.js';
import type { ItemTag } from '../domain/item.js';
import type { Basics } from '../domain/master-resume.js';
import type { MasterResumeGet } from '../domain/wire.js';
import type { WireItem } from '../domain/wire.js';

export function toWireItem(item: Item): WireItem {
  const wireItem = { ...item };
  delete (wireItem as Partial<Item>).masterId;
  return wireItem as WireItem;
}

export function toPersistentItem(wireItem: WireItem, masterId: string): Item {
  return { ...wireItem, masterId };
}

export function toMasterResumeGet(input: {
  id: string;
  basics: Basics;
  items: Item[];
  itemTags: ItemTag[];
  updatedAt: Date;
}): MasterResumeGet {
  return {
    id: input.id,
    basics: input.basics,
    items: input.items.map(toWireItem),
    itemTags: input.itemTags,
    updatedAt: input.updatedAt,
  };
}

export function toPersistentItems(
  wireItems: WireItem[],
  masterId: string,
): Item[] {
  return wireItems.map((item) => toPersistentItem(item, masterId));
}
