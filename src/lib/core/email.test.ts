import { describe, expect, it } from 'vitest';
import { isValidEmail, normalizeEmail } from './email';

describe('email', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeEmail('  Ilias@Example.COM ')).toBe('ilias@example.com');
    expect(normalizeEmail(null)).toBe('');
  });

  it.each(['a@b.co', 'first.last+tag@sub.example.be'])('accepts %s', (e) => {
    expect(isValidEmail(e)).toBe(true);
  });

  it.each(['', 'no-at.example', 'a@b', 'a b@c.de', `${'a'.repeat(250)}@b.co`])(
    'rejects %s',
    (e) => {
      expect(isValidEmail(e)).toBe(false);
    },
  );
});
