import { timingSafeEqual } from 'node:crypto';
import { removeAbandonedDocuments } from '@/lib/server/document-cleanup';
import { runReminders } from '@/lib/server/reminder-job';

// Sending can take a while when many reminders are due at once.
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  return (
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const now = new Date();
    const summary = await runReminders(now);
    // Housekeeping once a day, in the 03:00 UTC run, or when asked explicitly.
    const daily = now.getUTCHours() === 3 && now.getUTCMinutes() < 15;
    const asked = new URL(request.url).searchParams.get('cleanup') === '1';
    if (daily || asked) {
      const removed = await removeAbandonedDocuments(now).catch((err) => {
        console.error('Document cleanup failed', err);
        return null;
      });
      return Response.json({ ...summary, abandonedDocumentsRemoved: removed });
    }
    return Response.json(summary);
  } catch (err) {
    console.error('Reminder run failed', err);
    return Response.json({ error: 'Reminder run failed' }, { status: 500 });
  }
}

// The database schedule calls POST; GET also works for Vercel Cron or a manual run.
export const POST = handle;
export const GET = handle;
