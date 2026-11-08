'use client';

import { useEffect, useRef, useState } from 'react';

// The order of the letters on a split-flap drum. Flaps only ever turn forward.
const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789€.,:-/'!&";
const STEP_MS = 42;
const STAGGER_MS = 22;
const FLIP: Keyframe[] = [
  { transform: 'perspective(240px) rotateX(78deg)', opacity: 0.55 },
  { transform: 'none', opacity: 1 },
];

export type Tone = 'white' | 'amber' | 'red' | 'dim';

function drumIndex(ch: string) {
  const i = DRUM.indexOf(ch);
  return i === -1 ? 0 : i;
}

function fit(text: string, length: number, align: 'left' | 'right') {
  const clean = Array.from(text.toUpperCase())
    .map((c) => (DRUM.includes(c) ? c : ' '))
    .join('')
    .slice(0, length);
  return align === 'right' ? clean.padStart(length) : clean.padEnd(length);
}

/**
 * A run of split-flap tiles. Server-renders the final text (hidden until the
 * board goes live), then turns each flap forward through the drum to it.
 */
export function Flaps({
  text,
  length,
  tone = 'white',
  align = 'left',
  delay = 0,
  className = '',
}: {
  text: string;
  length: number;
  tone?: Tone;
  align?: 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = fit(text, length, align);
  // React owns the first render only; after that the effect turns the flaps.
  const [initial] = useState(target);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cells = Array.from(
      root.querySelectorAll<HTMLSpanElement>('[data-cell]'),
    );
    const firstRun = !('live' in root.dataset);
    root.dataset.live = '';

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const show = (el: HTMLSpanElement, ch: string) => {
      el.textContent = ch === ' ' ? ' ' : ch;
      el.dataset.cur = ch;
    };

    if (reduce) {
      cells.forEach((el, i) => show(el, target[i]));
      return;
    }

    const L = DRUM.length;
    const start = performance.now() + delay;
    const state = cells.map((el, i) => {
      const from = firstRun ? ' ' : (el.dataset.cur ?? ' ');
      const goal = drumIndex(target[i]);
      let cur = drumIndex(from);
      const steps = (goal - cur + L) % L;
      const maxSteps = 5 + Math.floor(Math.random() * 9);
      if (steps > maxSteps) cur = (goal - maxSteps + L) % L;
      if (firstRun) show(el, steps > 0 ? DRUM[cur] : target[i]);
      return {
        el,
        cur,
        goal,
        next: start + i * STAGGER_MS + Math.random() * 40,
      };
    });

    let raf = 0;
    const tick = (now: number) => {
      let active = false;
      for (const s of state) {
        if (s.cur === s.goal) continue;
        active = true;
        if (now < s.next) continue;
        s.cur = (s.cur + 1) % L;
        show(s.el, DRUM[s.cur]);
        s.el.animate(FLIP, { duration: 70, easing: 'ease-out' });
        s.next = now + STEP_MS;
      }
      if (active) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`st-flaps ${tone === 'white' ? '' : `st-tone-${tone}`} ${className}`}
    >
      {Array.from(initial).map((ch, i) => (
        <span key={i} className="st-tile">
          <span data-cell="">{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </span>
  );
}

/** One blank column between fields. */
export function Gap({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`st-gap ${className}`} />;
}
