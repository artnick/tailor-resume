import type { RenderModel } from '@repo/shared';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderClassicHtml(model: RenderModel): string {
  const contact = [
    model.basics.email,
    model.basics.phone,
    model.basics.location?.city,
  ]
    .filter(Boolean)
    .map((part) => escapeHtml(String(part)))
    .join(' · ');

  const summary = model.summary
    .map((block) => `<p>${escapeHtml(block.text)}</p>`)
    .join('');

  const work = model.work
    .map((entry) => {
      const bullets = entry.bullets
        .map((bullet) => `<li>${escapeHtml(bullet.text)}</li>`)
        .join('');
      return `
        <div class="entry">
          <div class="entry-header">
            <strong>${escapeHtml(entry.position ?? '')}</strong>
            <span>${escapeHtml(entry.company ?? entry.name ?? '')}</span>
          </div>
          <div class="entry-dates">${escapeHtml(entry.startDate)} – ${entry.endDate == null ? 'Present' : escapeHtml(entry.endDate)}</div>
          <ul>${bullets}</ul>
        </div>`;
    })
    .join('');

  const skillGroups = [
    ...model.skillGroups.map(
      (group) =>
        `<p><strong>${escapeHtml(group.name)}:</strong> ${group.skills.map((skill) => escapeHtml(skill.text)).join(', ')}</p>`,
    ),
    model.skills.length > 0
      ? `<p>${model.skills.map((skill) => escapeHtml(skill.text)).join(', ')}</p>`
      : '',
  ].join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(model.basics.name)}</title>
  <style>
    body { font-family: Georgia, serif; color: #111; max-width: 800px; margin: 40px auto; line-height: 1.5; }
    h1 { margin: 0 0 4px; font-size: 28px; }
    .subtitle { color: #555; margin-bottom: 8px; }
    .contact { color: #444; margin-bottom: 24px; font-size: 14px; }
    h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; }
    .entry { margin-bottom: 16px; }
    .entry-header { display: flex; justify-content: space-between; gap: 12px; }
    .entry-dates { color: #666; font-size: 13px; margin-bottom: 4px; }
    ul { margin: 6px 0 0 18px; padding: 0; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(model.basics.name)}</h1>
  ${model.basics.label ? `<div class="subtitle">${escapeHtml(model.basics.label)}</div>` : ''}
  ${contact ? `<div class="contact">${contact}</div>` : ''}
  ${summary ? `<h2>Summary</h2>${summary}` : ''}
  ${work ? `<h2>Experience</h2>${work}` : ''}
  ${skillGroups ? `<h2>Skills</h2>${skillGroups}` : ''}
</body>
</html>`;
}

const templates: Record<string, (model: RenderModel) => string> = {
  classic: renderClassicHtml,
};

export function renderHtml(model: RenderModel): string {
  const template = templates[model.templateId] ?? renderClassicHtml;
  return template(model);
}
