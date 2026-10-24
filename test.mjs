import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tokens from './tokens/tokens.json' with { type: 'json' };

const root = dirname(fileURLToPath(import.meta.url));
const KEYS = ['bg', 'surface', 'text', 'text-muted', 'primary', 'on-primary', 'border', 'danger'];
const SCREENS = ['first-run', 'lobby', 'chat', 'services', 'wallet', 'settings'];

const lum = h => {
  const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

test('both themes carry every required colour token as #rrggbb', () => {
  for (const theme of ['light', 'dark']) {
    for (const k of KEYS) {
      const v = tokens.color[theme][k];
      assert.match(v, /^#[0-9a-f]{6}$/i, `${theme}.${k}`);
    }
  }
  for (const g of ['type', 'space', 'radius']) assert.ok(tokens[g], g);
});

test('text and primary pairs meet WCAG AA 4.5:1 on their surfaces', () => {
  for (const theme of ['light', 'dark']) {
    const t = tokens.color[theme];
    assert.ok(contrast(t.text, t.bg) >= 4.5, `${theme} text/bg`);
    assert.ok(contrast(t.text, t.surface) >= 4.5, `${theme} text/surface`);
    assert.ok(contrast(t['on-primary'], t.primary) >= 4.5, `${theme} on-primary/primary`);
  }
});

test('tokens.css mirrors tokens.json for light, dark and [data-theme]', () => {
  const css = readFileSync(join(root, 'tokens/tokens.css'), 'utf8');
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /\[data-theme="dark"\]/);
  for (const theme of ['light', 'dark'])
    for (const k of KEYS)
      assert.ok(css.includes(`--color-${k}: ${tokens.color[theme][k]};`), `${theme} ${k}`);
});

test('prototype has index, design-system and every screen in en and ar', () => {
  for (const f of ['index.html', 'design-system.html', ...SCREENS.map(s => `${s}.html`)])
    assert.doesNotThrow(() => readFileSync(join(root, 'prototype', f)), f);
  for (const s of SCREENS) {
    const html = readFileSync(join(root, 'prototype/ar', `${s}.html`), 'utf8');
    assert.match(html, /<html lang="ar" dir="rtl">/, `ar/${s} rtl+lang`);
  }
});

test('index.html links every screen and the design system', () => {
  const idx = readFileSync(join(root, 'prototype/index.html'), 'utf8');
  for (const s of SCREENS) assert.ok(idx.includes(`href="${s}.html"`), s);
  assert.ok(idx.includes('design-system.html'));
});
