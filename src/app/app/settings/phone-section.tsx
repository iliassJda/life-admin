'use client';

import { useEffect, useState } from 'react';
import { removeDevice, saveDevice, sendTestNotification } from './push-actions';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIos() {
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
}

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua)
    ? 'iPhone'
    : /iPad/.test(ua)
      ? 'iPad'
      : /Android/.test(ua)
        ? 'Android'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Mac/.test(ua)
            ? 'Mac'
            : 'Device';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'browser';
  return `${os}, ${browser}${isInstalled() ? ' (installed app)' : ''}`;
}

function base64ToBytes(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function Install() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [state, setState] = useState<
    'loading' | 'installed' | 'ios' | 'prompt' | 'other'
  >('loading');

  useEffect(() => {
    const decide = () =>
      setState(isInstalled() ? 'installed' : isIos() ? 'ios' : 'other');
    const timer = setTimeout(decide, 0);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      setState('prompt');
    };
    const onInstalled = () => setState('installed');
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  return (
    <div className="rounded-[3px] border border-(--st-rule) p-5">
      <h3 className="text-[16px] font-semibold">Install the app</h3>
      {state === 'installed' && (
        <p className="mt-2 text-[15px] text-(--st-dim)">
          Kalends is installed on this device. Open it from your home screen.
        </p>
      )}
      {state === 'prompt' && prompt && (
        <>
          <p className="mt-2 text-[15px] leading-relaxed text-(--st-dim)">
            Add Kalends to your home screen. It opens like an app, without the
            browser around it.
          </p>
          <button
            type="button"
            className="st-btn mt-4"
            onClick={async () => {
              await prompt.prompt();
              const choice = await prompt.userChoice;
              setPrompt(null);
              setState(choice.outcome === 'accepted' ? 'installed' : 'other');
            }}
          >
            Install Kalends
          </button>
        </>
      )}
      {state === 'ios' && (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-(--st-dim)">
          <li>
            Open kalends.me in <span className="text-(--st-white)">Safari</span>
            .
          </li>
          <li>
            Tap the <span className="text-(--st-white)">Share</span> button (the
            square with an arrow).
          </li>
          <li>
            Choose <span className="text-(--st-white)">Add to Home Screen</span>
            , then Add.
          </li>
          <li>
            Open Kalends from your home screen and turn on notifications below.
            iPhone only allows notifications for apps on the home screen (iOS
            16.4 or later).
          </li>
        </ol>
      )}
      {state === 'other' && (
        <p className="mt-2 text-[15px] leading-relaxed text-(--st-dim)">
          On your phone, open kalends.me and use the browser menu:{' '}
          <span className="text-(--st-white)">Install app</span> or{' '}
          <span className="text-(--st-white)">Add to Home screen</span>.
        </p>
      )}
    </div>
  );
}

type PushState =
  'loading' | 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on';

function Notifications({ deviceCount }: { deviceCount: number }) {
  const [state, setState] = useState<PushState>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      let next: PushState;
      if (!supported || !publicKey) {
        next = isIos() && !isInstalled() ? 'needs-install' : 'unsupported';
      } else if (Notification.permission === 'denied') {
        next = 'denied';
      } else {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        next = sub ? 'on' : 'off';
      }
      if (!cancelled) setState(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  async function turnOn() {
    setBusy(true);
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      // Some browsers never answer when their push service is unreachable.
      const sub = await Promise.race([
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToBytes(publicKey!),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 20_000),
        ),
      ]);
      const json = sub.toJSON();
      const saved = await saveDevice({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
        device: deviceLabel(),
      });
      if (!saved.ok) {
        await sub.unsubscribe();
        setMessage('We couldn’t save this device. Please try again.');
        return;
      }
      setState('on');
      setMessage('Notifications are on. Send a test to check.');
    } catch (err) {
      setMessage(
        err instanceof Error && err.message === 'timeout'
          ? 'Your browser’s notification service didn’t respond. Check your connection and try again, or try another browser.'
          : 'Turning notifications on didn’t work in this browser.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setMessage('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await removeDevice(sub.endpoint);
        await sub.unsubscribe();
      }
      setState('off');
      setMessage('Notifications are off on this device.');
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    const result = await sendTestNotification();
    setMessage(result.message);
    setBusy(false);
  }

  return (
    <div className="rounded-[3px] border border-(--st-rule) p-5">
      <h3 className="text-[16px] font-semibold">Notifications</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-(--st-dim)">
        Get your reminders as notifications too, at the same time as the emails.
        {deviceCount > 0 &&
          ` On for ${deviceCount} ${deviceCount === 1 ? 'device' : 'devices'}.`}
      </p>

      {state === 'unsupported' && (
        <p className="mt-3 text-[15px]">
          This browser can’t show notifications. Try Chrome, Edge, Firefox or
          Safari, or install the app on your phone.
        </p>
      )}
      {state === 'needs-install' && (
        <p className="mt-3 text-[15px]">
          On iPhone, add Kalends to your home screen first (see above), then
          open it from there to turn on notifications.
        </p>
      )}
      {state === 'denied' && (
        <p className="mt-3 text-[15px]">
          Notifications are blocked for this site. Allow them in your browser or
          phone settings, then come back here.
        </p>
      )}
      {(state === 'off' || state === 'on') && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {state === 'off' ? (
            <button
              type="button"
              className="st-btn"
              disabled={busy}
              onClick={turnOn}
            >
              {busy ? 'Turning on…' : 'Turn on for this device'}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="st-btn-outline"
                disabled={busy}
                onClick={test}
              >
                Send a test notification
              </button>
              <button
                type="button"
                className="st-focus px-2 py-2 text-[15px] font-semibold text-(--st-dim) underline-offset-4 hover:text-(--st-white) hover:underline"
                disabled={busy}
                onClick={turnOff}
              >
                Turn off for this device
              </button>
            </>
          )}
        </div>
      )}
      <p
        aria-live="polite"
        className="mt-3 min-h-5 text-[14px] text-(--st-amber)"
      >
        {message}
      </p>
    </div>
  );
}

export function PhoneSection({ deviceCount }: { deviceCount: number }) {
  return (
    <div className="space-y-4">
      <Install />
      <Notifications deviceCount={deviceCount} />
    </div>
  );
}
