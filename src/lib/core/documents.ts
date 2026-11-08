const FILE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|heic|heif|pdf)$/;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
};

export function documentExtension(mimeType: string): string | null {
  return EXTENSIONS[mimeType] ?? null;
}

/** A path inside the person's own folder that we generated: "<user id>/<uuid>.<ext>". */
export function isOwnDocumentPath(
  path: unknown,
  userId: string,
): path is string {
  if (typeof path !== 'string') return false;
  const prefix = `${userId}/`;
  return path.startsWith(prefix) && FILE.test(path.slice(prefix.length));
}
