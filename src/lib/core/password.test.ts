import { describe, expect, it } from 'vitest';
import { passwordProblem } from './password';

describe('passwordProblem', () => {
  it('accepts 8 characters or more', () => {
    expect(passwordProblem('abcdefgh')).toBeNull();
    expect(passwordProblem('correct horse battery staple')).toBeNull();
  });

  it('rejects short passwords', () => {
    expect(passwordProblem('abc1234')).toMatch(/at least 8/);
  });

  it('rejects passwords bcrypt would cut off', () => {
    expect(passwordProblem('a'.repeat(72))).toBeNull();
    expect(passwordProblem('a'.repeat(73))).toMatch(/shorter/);
    // 25 three-byte characters is 75 bytes.
    expect(passwordProblem('€'.repeat(25))).toMatch(/shorter/);
  });

  it('rejects only spaces', () => {
    expect(passwordProblem('          ')).toMatch(/spaces/);
  });
});
