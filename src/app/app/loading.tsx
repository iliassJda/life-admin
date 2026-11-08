// Shown the moment a page in the app is clicked, while the server answers.
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-[44px] w-56 rounded-[3px] bg-(--st-housing) sm:h-[56px]" />
      <div className="mt-10 space-y-0">
        <div className="mb-1 h-3 w-24 rounded-[2px] bg-(--st-housing)" />
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-(--st-rule) py-4"
          >
            <span className="st-static-tiles" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="flex-1 space-y-2">
              <span className="block h-4 w-40 rounded-[2px] bg-(--st-housing)" />
              <span className="block h-3 w-28 rounded-[2px] bg-(--st-housing)" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
