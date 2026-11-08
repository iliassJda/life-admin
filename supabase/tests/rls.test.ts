/**
 * Row-level security check against the LOCAL database: two accounts, and
 * neither can read or change the other's data. Run with `npm run test:db`
 * while `npm run db:start` is up.
 */
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Keys come from the running local Supabase (`supabase status`), so none
// are stored in the repo. This test never runs against production.
function localStack(): Record<string, string> {
  const out = execSync('npx supabase status -o json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(out.slice(out.indexOf('{')));
}

const stack = localStack();
const URL = stack.API_URL;
const PUBLISHABLE = stack.PUBLISHABLE_KEY;
const SECRET = stack.SECRET_KEY;

if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(URL)) {
  throw new Error('The RLS test only runs against a local Supabase.');
}

const admin = createClient(URL, SECRET, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Account = { id: string; client: SupabaseClient; itemId: string };

async function makeAccount(label: string): Promise<Account> {
  const email = `rls-${label}-${randomUUID().slice(0, 8)}@kalends.test`;
  const password = randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('createUser failed');

  const client = createClient(URL, PUBLISHABLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  const { data: item, error: itemError } = await client
    .from('items')
    .insert({
      kind: 'document',
      name: `${label} passport`,
      key_date: '2030-01-01',
    })
    .select('id')
    .single();
  if (itemError || !item) throw itemError ?? new Error('insert failed');

  await admin.from('notifications_sent').insert({
    user_id: data.user.id,
    item_id: item.id,
    occurrence_date: '2030-01-01',
    days_before: 7,
    channel: 'email',
  });

  return { id: data.user.id, client, itemId: item.id };
}

let alice: Account;
let bob: Account;

beforeAll(async () => {
  alice = await makeAccount('alice');
  bob = await makeAccount('bob');
});

afterAll(async () => {
  for (const account of [alice, bob]) {
    if (!account) continue;
    const { data: files } = await admin.storage
      .from('documents')
      .list(account.id);
    if (files?.length) {
      await admin.storage
        .from('documents')
        .remove(files.map((f) => `${account.id}/${f.name}`));
    }
    await admin.auth.admin.deleteUser(account.id);
  }
});

describe('each account sees only its own data', () => {
  it('items', async () => {
    const { data } = await bob.client.from('items').select('id');
    expect(data?.map((r) => r.id)).toEqual([bob.itemId]);
  });

  it('profiles', async () => {
    const { data } = await bob.client.from('profiles').select('id');
    expect(data?.map((r) => r.id)).toEqual([bob.id]);
  });

  it('reminder rules', async () => {
    const { data } = await bob.client.from('reminder_rules').select('user_id');
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.every((r) => r.user_id === bob.id)).toBe(true);
  });

  it('the send log', async () => {
    const { data } = await bob.client
      .from('notifications_sent')
      .select('item_id');
    expect(data?.map((r) => r.item_id)).toEqual([bob.itemId]);
  });

  it('the waitlist is not readable at all', async () => {
    const { data } = await bob.client.from('waitlist').select('email');
    expect(data ?? []).toEqual([]);
  });
});

describe('no account can change another’s data', () => {
  it('cannot update someone else’s item', async () => {
    const { data } = await bob.client
      .from('items')
      .update({ name: 'hacked' })
      .eq('id', alice.itemId)
      .select('id');
    expect(data).toEqual([]);
    const { data: check } = await admin
      .from('items')
      .select('name')
      .eq('id', alice.itemId)
      .single();
    expect(check?.name).toBe('alice passport');
  });

  it('cannot delete someone else’s item', async () => {
    await bob.client.from('items').delete().eq('id', alice.itemId);
    const { count } = await admin
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('id', alice.itemId);
    expect(count).toBe(1);
  });

  it('cannot create an item in someone else’s name', async () => {
    const { error } = await bob.client.from('items').insert({
      user_id: alice.id,
      kind: 'document',
      name: 'planted',
      key_date: '2030-01-01',
    });
    expect(error).not.toBeNull();
  });

  it('cannot attach a reminder rule to someone else’s item', async () => {
    const { error } = await bob.client
      .from('reminder_rules')
      .insert({ user_id: bob.id, item_id: alice.itemId, days_before: 3 });
    expect(error).not.toBeNull();
  });

  it('cannot change someone else’s profile', async () => {
    const { data } = await bob.client
      .from('profiles')
      .update({ email_reminders: false })
      .eq('id', alice.id)
      .select('id');
    expect(data).toEqual([]);
  });

  it('cannot write to the send log', async () => {
    const { error } = await bob.client.from('notifications_sent').insert({
      user_id: bob.id,
      item_id: bob.itemId,
      occurrence_date: '2030-01-01',
      days_before: 1,
      channel: 'email',
    });
    expect(error).not.toBeNull();
  });
});

describe('scanned documents stay private', () => {
  const file = () => `${randomUUID()}.pdf`;
  const pdf = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
  let alicePath = '';

  beforeAll(async () => {
    alicePath = `${alice.id}/${file()}`;
    const { error } = await alice.client.storage
      .from('documents')
      .upload(alicePath, pdf, { contentType: 'application/pdf' });
    if (error) throw error;
  });

  it('the owner can open their own file', async () => {
    const { data, error } = await alice.client.storage
      .from('documents')
      .download(alicePath);
    expect(error).toBeNull();
    expect(data?.size).toBeGreaterThan(0);
  });

  it('another account cannot open, list or delete it', async () => {
    const { data } = await bob.client.storage
      .from('documents')
      .download(alicePath);
    expect(data).toBeNull();
    const { data: listed } = await bob.client.storage
      .from('documents')
      .list(alice.id);
    expect(listed ?? []).toEqual([]);
    await bob.client.storage.from('documents').remove([alicePath]);
    const { data: still } = await admin.storage
      .from('documents')
      .download(alicePath);
    expect(still).not.toBeNull();
  });

  it('another account cannot upload into someone else’s folder', async () => {
    const { error } = await bob.client.storage
      .from('documents')
      .upload(`${alice.id}/${file()}`, pdf, { contentType: 'application/pdf' });
    expect(error).not.toBeNull();
  });

  it('an item cannot point at someone else’s file', async () => {
    const { error } = await bob.client
      .from('items')
      .update({ file_path: alicePath })
      .eq('id', bob.itemId);
    expect(error).not.toBeNull();
  });

  it('signed-out visitors cannot open it', async () => {
    const anon = createClient(URL, PUBLISHABLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await anon.storage.from('documents').download(alicePath);
    expect(data).toBeNull();
  });
});

describe('notification devices stay private', () => {
  const device = (who: string) => ({
    endpoint: `https://push.invalid/${who}-${randomUUID()}`,
    p256dh: 'key',
    auth: 'auth',
  });

  it('each account sees only its own devices', async () => {
    const { error } = await alice.client
      .from('push_subscriptions')
      .insert({ user_id: alice.id, ...device('alice') });
    expect(error).toBeNull();
    const { data } = await bob.client.from('push_subscriptions').select('id');
    expect(data ?? []).toEqual([]);
  });

  it('no account can add a device in someone else’s name', async () => {
    const { error } = await bob.client
      .from('push_subscriptions')
      .insert({ user_id: alice.id, ...device('bob') });
    expect(error).not.toBeNull();
  });
});

describe('signed-out visitors', () => {
  const anon = createClient(URL, PUBLISHABLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  it('read nothing', async () => {
    for (const table of [
      'items',
      'profiles',
      'reminder_rules',
      'notifications_sent',
    ]) {
      const { data } = await anon.from(table).select('*');
      expect(data ?? [], table).toEqual([]);
    }
  });
});
