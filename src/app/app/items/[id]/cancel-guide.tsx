import { GUIDES_CHECKED, type CancelGuide } from '@/lib/core/cancel-guides';

export function CancelGuideSection({
  guide,
  unused,
}: {
  guide: CancelGuide;
  unused: boolean;
}) {
  return (
    <section
      aria-labelledby="cancel-heading"
      className={`mt-14 rounded-[3px] border p-5 sm:p-6 ${
        unused ? 'border-(--st-amber)' : 'border-(--st-rule)'
      }`}
    >
      <h2 id="cancel-heading" className="st-heading text-[26px]">
        How to cancel {guide.name}
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {guide.notes.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-[14px] leading-relaxed text-(--st-dim)">
          {guide.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <a
        href={guide.url}
        target="_blank"
        rel="noopener noreferrer"
        className="st-btn-outline mt-5"
      >
        Open the official help page
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
          <path
            d="M6 3h7v7M13 3 4 12"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
          />
        </svg>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <p className="mt-3 text-[13px] text-(--st-dim)">
        Checked {GUIDES_CHECKED}. Menus change; if a step doesn’t match, the
        official page is the one to follow.
      </p>
    </section>
  );
}
