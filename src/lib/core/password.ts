export const MIN_PASSWORD_LENGTH = 8;
// Supabase hashes with bcrypt, which ignores anything past 72 bytes.
export const MAX_PASSWORD_BYTES = 72;

/** Why a new password can't be used, or null when it's fine. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return 'Use a shorter password (at most 72 characters).';
  }
  if (password.trim().length === 0) {
    return 'A password can’t be only spaces.';
  }
  return null;
}
