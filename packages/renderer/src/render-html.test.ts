import { describe, expect, it } from 'vitest';
import type { RenderModel } from '@repo/shared';
import { renderHtml } from './render-html.js';

const sample: RenderModel = {
  basics: { name: 'Alex', label: 'Engineer', email: 'alex@example.com' },
  templateId: 'classic',
  summary: [{ id: 's1', text: 'Fullstack engineer.' }],
  work: [
    {
      id: 'w1',
      company: 'Acme',
      position: 'SWE',
      startDate: '2021-01',
      endDate: null,
      bullets: [{ id: 'b1', text: 'Built APIs' }],
    },
  ],
  education: [],
  projects: [],
  skillGroups: [],
  skills: [{ id: 'sk1', text: 'React' }],
};

describe('renderHtml', () => {
  it('renders basics and sections', () => {
    const html = renderHtml(sample);
    expect(html).toContain('Alex');
    expect(html).toContain('Fullstack engineer.');
    expect(html).toContain('Built APIs');
    expect(html).toContain('React');
  });
});
