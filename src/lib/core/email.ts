const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL.test(email);
}
