import Link from 'next/link';
import { findPreset, PRESETS } from '@/lib/core/presets';
import { describeReminderDays } from '@/lib/core/settings';
import { requireUser } from '@/lib/server/auth';
import { NewItemFlow } from './new-item-flow';

// Reading a document with Gemini can take a while.
export const maxDuration = 60;

export default async function NewItemPage(props: PageProps<'/app/items/new'>) {
  const query = await props.searchParams;
  const preset = findPreset(query.preset);
  const { supabase, id } = await requireUser();
  const { data: defaults } = await supabase
    .from('reminder_rules')
    .select('days_before')
    .is('item_id', null);

  return (
    <div className="max-w-xl">
      <h1 className="st-heading mb-8 text-[44px] sm:text-[56px]">
        Add an item
      </h1>

      <NewItemFlow
        key={preset?.id ?? 'blank'}
        userId={id}
        defaultsLabel={describeReminderDays(
          (defaults ?? []).map((r) => r.days_before),
        )}
        initial={{
          kind: preset?.kind ?? 'subscription',
          name: preset?.name ?? '',
          repeat: preset?.repeat ?? '1-month',
          currency: 'EUR',
        }}
        presets={
          <div>
            <h2 className="st-label mb-3">Or start from a common one</h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/items/new?preset=${p.id}`}
                  aria-current={p.id === preset?.id ? 'true' : undefined}
                  className="st-chip aria-[current=true]:border-(--st-yellow) aria-[current=true]:text-(--st-yellow)"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
