import { describe, expect, it } from 'vitest';
import { safeNextPath } from './redirect';

describe('safeNextPath', () => {
  it('keeps paths on this site', () => {
    expect(safeNextPath('/app')).toBe('/app');
    expect(safeNextPath('/app/items?view=week')).toBe('/app/items?view=week');
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('falls back to /app for %s', (value) => {
    expect(safeNextPath(value)).toBe('/app');
  });
});
