import 'server-only';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
const signupsFile = path.join(dir, 'waitlist.jsonl');
const answersFile = path.join(dir, 'waitlist-answers.jsonl');

async function isOnList(email: string): Promise<boolean> {
  const existing = await readFile(signupsFile, 'utf8').catch(() => '');
  return existing
    .split('\n')
    .filter(Boolean)
    .some((line) => JSON.parse(line).email === email);
}

async function append(file: string, record: object) {
  await mkdir(dir, { recursive: true });
  await appendFile(file, JSON.stringify(record) + '\n');
}

export async function addToWaitlist(
  email: string,
): Promise<'added' | 'exists'> {
  if (await isOnList(email)) return 'exists';
  await append(signupsFile, { email, joinedAt: new Date().toISOString() });
  return 'added';
}

export async function recordAnswer(
  email: string,
  track: string[],
  other: string,
): Promise<boolean> {
  if (!(await isOnList(email))) return false;
  await append(answersFile, {
    email,
    track,
    other,
    answeredAt: new Date().toISOString(),
  });
  return true;
}
