'use server';

import { requireUser } from '@/lib/server/auth';
import { pushConfigured, sendPushToUser } from '@/lib/server/push';

export type DeviceInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  device: string;
};

function valid(input: DeviceInput): boolean {
  return (
    typeof input?.endpoint === 'string' &&
    input.endpoint.startsWith('https://') &&
    input.endpoint.length <= 2000 &&
    typeof input.keys?.p256dh === 'string' &&
    input.keys.p256dh.length <= 200 &&
    typeof input.keys?.auth === 'string' &&
    input.keys.auth.length <= 100
  );
}

/** Remembers this browser or installed app as a place to send reminders. */
export async function saveDevice(input: DeviceInput): Promise<{ ok: boolean }> {
  if (!valid(input)) return { ok: false };
  const { supabase, id } = await requireUser();
  // The same endpoint may have belonged to someone who signed out here.
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', input.endpoint);
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: id,
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
    device: String(input.device ?? '').slice(0, 200) || null,
  });
  return { ok: !error };
}

export async function removeDevice(endpoint: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  return { ok: !error };
}

export async function sendTestNotification(): Promise<{
  ok: boolean;
  message: string;
}> {
  const { id } = await requireUser();
  if (!pushConfigured()) {
    return {
      ok: false,
      message: 'Notifications aren’t set up on the server yet.',
    };
  }
  const { devices, delivered } = await sendPushToUser(id, {
    title: 'Kalends notifications are on',
    body: 'This is how your reminders will arrive on this device.',
    url: '/app',
    tag: 'kalends-test',
  });
  if (delivered > 0) {
    return {
      ok: true,
      message:
        devices > 1
          ? `Sent to ${delivered} of your ${devices} devices.`
          : 'Sent. It should appear in a few seconds.',
    };
  }
  return {
    ok: false,
    message:
      'No device accepted it. Try turning notifications off and on again.',
  };
}
