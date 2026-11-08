import { site } from '@/lib/core/site';

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`st-cond font-extrabold tracking-[-0.01em] ${className}`}>
      {site.name}
      <span className="text-(--st-yellow)">.</span>
    </span>
  );
}
