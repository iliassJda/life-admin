export const DEFAULT_AFTER_SIGN_IN = '/app';

export function safeNextPath(value: unknown): string {
  const path = typeof value === 'string' ? value : '';
  const isLocal =
    path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
  return isLocal ? path : DEFAULT_AFTER_SIGN_IN;
}
