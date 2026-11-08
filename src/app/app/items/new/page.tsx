import Link from 'next/link';
import { findPreset, PRESETS } from '@/lib/core/presets';
import { describeReminderDays } from '@/lib/core/settings';
import { requireUser } from '@/lib/server/auth';
import { createItem } from '../actions';
import { ItemForm } from '../item-form';

export default async function NewItemPage(props: PageProps<'/app/items/new'>) {
  const query = await props.searchParams;
  const preset = findPreset(query.preset);
  const { supabase } = await requireUser();
  const { data: defaults } = await supabase
    .from('reminder_rules')
    .select('days_before')
    .is('item_id', null);

  return (
    <div className="max-w-xl">
      <h1 className="st-heading text-[44px] sm:text-[56px]">Add an item</h1>

      <div className="mt-6 mb-10">
        <p className="st-label mb-3">Quick start</p>
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

      <ItemForm
        key={preset?.id ?? 'blank'}
        action={createItem}
        submitLabel="Add item"
        defaultsLabel={describeReminderDays(
          (defaults ?? []).map((r) => r.days_before),
        )}
        initial={{
          kind: preset?.kind ?? 'subscription',
          name: preset?.name ?? '',
          repeat: preset?.repeat ?? '1-month',
          currency: 'EUR',
        }}
      />
    </div>
  );
}
