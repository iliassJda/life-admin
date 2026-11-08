import { timingSafeEqual } from 'node:crypto';
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
    const summary = await runReminders();
    return Response.json(summary);
  } catch (err) {
    console.error('Reminder run failed', err);
    return Response.json({ error: 'Reminder run failed' }, { status: 500 });
  }
}

// The database schedule calls POST; GET also works for Vercel Cron or a manual run.
export const POST = handle;
export const GET = handle;
