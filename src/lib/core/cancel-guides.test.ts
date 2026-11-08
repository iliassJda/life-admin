import { describe, expect, it } from 'vitest';
import { CANCEL_GUIDES, findCancelGuide } from './cancel-guides';

const id = (name: string) => findCancelGuide(name)?.id ?? null;

describe('findCancelGuide', () => {
  it('matches common names regardless of case and extra words', () => {
    expect(id('Netflix')).toBe('netflix');
    expect(id('netflix premium')).toBe('netflix');
    expect(id('Spotify Family')).toBe('spotify');
    expect(id('Disney+')).toBe('disney');
    expect(id('Amazon Prime')).toBe('amazon-prime');
    expect(id('Adobe Creative Cloud')).toBe('adobe');
    expect(id('Basic-Fit')).toBe('basic-fit');
    expect(id('Basic Fit gym')).toBe('basic-fit');
  });

  it('prefers the most specific alias', () => {
    expect(id('YouTube Premium')).toBe('youtube-premium');
    expect(id('Xbox Game Pass Ultimate')).toBe('xbox');
    expect(id('HBO Max')).toBe('hbo-max');
  });

  it('covers providers through the general guides', () => {
    expect(id('Telenet internet')).toBe('telecom');
    expect(id('KPN')).toBe('telecom');
    expect(id('Engie electricity')).toBe('energy');
    expect(id('Eneco')).toBe('energy');
  });

  it('matches whole words only', () => {
    expect(id('Baseball club')).toBeNull();
    expect(id('Gaston’s bakery')).toBeNull();
    expect(id('Passport')).toBeNull();
  });

  it('returns nothing for unknown names', () => {
    expect(id('Car insurance')).toBeNull();
    expect(id('')).toBeNull();
  });
});

describe('CANCEL_GUIDES', () => {
  it('every guide links to an https page and has steps', () => {
    for (const g of CANCEL_GUIDES) {
      expect(g.url.startsWith('https://'), g.id).toBe(true);
      expect(g.steps.length, g.id).toBeGreaterThan(0);
    }
  });

  it('ids are unique', () => {
    const ids = CANCEL_GUIDES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
