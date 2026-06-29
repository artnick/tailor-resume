import { describe, expect, it } from 'vitest';

import type { Item } from '../domain/item.js';
import type { WireItem } from '../domain/wire.js';
import { toPersistentItem, toWireItem } from './master.js';

const masterId = 'master_demo';

const persistentItem: Item = {
  id: 'work_acme',
  masterId,
  section: 'work',
  parentId: null,
  isChoiceGroup: false,
  isDefaultChoice: false,
  pinned: false,
  data: {
    company: 'Acme',
    position: 'Senior SWE',
    startDate: '2021-03',
    endDate: null,
  },
  order: 0,
};

describe('master mappers', () => {
  it('strips masterId when mapping to wire item', () => {
    const wire = toWireItem(persistentItem);
    expect(wire).not.toHaveProperty('masterId');
    expect(wire.id).toBe('work_acme');
    expect(wire.section).toBe('work');
  });

  it('adds masterId when mapping to persistent item', () => {
    const wire = toWireItem(persistentItem) as WireItem;
    const restored = toPersistentItem(wire, masterId);
    expect(restored).toEqual(persistentItem);
  });
});
