import 'server-only';
import { sendNotification, setVapidDetails } from 'web-push';
import { supabaseAdmin as db } from './supabase';

export type PushPayload = {
  title: string;
  body: string;
  /** A path inside the app, opened when the notification is tapped. */
  url: string;
  /** Same tag replaces an earlier notification instead of stacking. */
  tag?: string;
};

let configured: boolean | null = null;

export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT ?? 'mailto:reminders@mail.iliass.net';
  configured = Boolean(publicKey && privateKey);
  if (configured) setVapidDetails(subject, publicKey!, privateKey!);
  return configured;
}

/**
 * Sends to every device the person turned notifications on for. Devices the
 * push service no longer knows (uninstalled, permission revoked) are removed.
 * Returns how many devices accepted it.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ devices: number; delivered: number }> {
  if (!pushConfigured()) return { devices: 0, delivered: 0 };
  const { data: devices, error } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  if (error) throw error;

  let delivered = 0;
  await Promise.all(
    (devices ?? []).map(async (d) => {
      try {
        await sendNotification(
          { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24, urgency: 'normal' },
        );
        delivered++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.from('push_subscriptions').delete().eq('id', d.id);
        } else {
          console.error('Push failed', status ?? 'unknown');
        }
      }
    }),
  );
  return { devices: devices?.length ?? 0, delivered };
}
