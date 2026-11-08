import { notFound } from 'next/navigation';
import { repeatValue } from '@/lib/core/items';
import { describeReminderDays } from '@/lib/core/settings';
import { requireUser } from '@/lib/server/auth';
import { deleteItem, updateItem } from '../actions';
import { DeleteButton } from '../delete-button';
import { ItemForm } from '../item-form';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditItemPage(
  props: PageProps<'/app/items/[id]'>,
) {
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();

  const { supabase } = await requireUser();
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!item) notFound();

  const { data: rules } = await supabase
    .from('reminder_rules')
    .select('item_id, days_before')
    .or(`item_id.is.null,item_id.eq.${item.id}`);
  const own = (rules ?? []).filter((r) => r.item_id === item.id);
  const defaults = (rules ?? []).filter((r) => r.item_id === null);

  return (
    <div className="max-w-xl">
      <h1 className="st-heading mb-10 text-[44px] sm:text-[56px]">
        {item.name}
      </h1>
      <ItemForm
        action={updateItem.bind(null, item.id)}
        submitLabel="Save changes"
        defaultsLabel={describeReminderDays(defaults.map((r) => r.days_before))}
        initial={{
          kind: item.kind,
          name: item.name,
          keyDate: item.key_date,
          repeat: repeatValue(item.recurrence_unit, item.recurrence_interval),
          amount: item.amount === null ? '' : String(item.amount),
          currency: item.currency,
          notes: item.notes ?? '',
          reminderMode: own.length > 0 ? 'custom' : 'default',
          reminderDays: own.map((r) => r.days_before).join(','),
        }}
      />
      <form
        action={deleteItem.bind(null, item.id)}
        className="mt-14 border-t border-(--st-rule) pt-6"
      >
        <DeleteButton name={item.name} />
      </form>
    </div>
  );
}
