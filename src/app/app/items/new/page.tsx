import Link from 'next/link';
import { findPreset, PRESETS } from '@/lib/core/presets';
import { createItem } from '../actions';
import { ItemForm } from '../item-form';

export default async function NewItemPage(props: PageProps<'/app/items/new'>) {
  const query = await props.searchParams;
  const preset = findPreset(query.preset);

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl font-light">Add an item</h1>

      <div className="mt-6 mb-10">
        <p className="text-ink-faint mb-3 text-[12px] tracking-[0.15em] uppercase">
          Quick start
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Link
              key={p.id}
              href={`/app/items/new?preset=${p.id}`}
              aria-current={p.id === preset?.id ? 'true' : undefined}
              className="border-line text-ink-soft hover:border-ink-faint hover:text-ink aria-[current=true]:border-accent aria-[current=true]:text-accent rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
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
