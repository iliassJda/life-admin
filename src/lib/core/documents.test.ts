import { describe, expect, it } from 'vitest';
import { documentExtension, isOwnDocumentPath } from './documents';

const user = '11111111-2222-3333-4444-555555555555';
const file = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf';

describe('isOwnDocumentPath', () => {
  it('accepts a generated file in the person’s own folder', () => {
    expect(isOwnDocumentPath(`${user}/${file}`, user)).toBe(true);
  });

  it('rejects other folders, traversal and odd names', () => {
    const other = '99999999-2222-3333-4444-555555555555';
    expect(isOwnDocumentPath(`${other}/${file}`, user)).toBe(false);
    expect(isOwnDocumentPath(`${user}/../${other}/${file}`, user)).toBe(false);
    expect(isOwnDocumentPath(`${user}/passport.pdf`, user)).toBe(false);
    expect(isOwnDocumentPath(`${user}/${file}.exe`, user)).toBe(false);
    expect(isOwnDocumentPath(null, user)).toBe(false);
  });
});

describe('documentExtension', () => {
  it('maps allowed types and refuses the rest', () => {
    expect(documentExtension('image/jpeg')).toBe('jpg');
    expect(documentExtension('application/pdf')).toBe('pdf');
    expect(documentExtension('text/html')).toBeNull();
  });
});
