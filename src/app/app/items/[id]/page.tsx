import { notFound } from 'next/navigation';
import { repeatValue } from '@/lib/core/items';
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

  return (
    <div className="max-w-xl">
      <h1 className="mb-10 font-serif text-4xl font-light">{item.name}</h1>
      <ItemForm
        action={updateItem.bind(null, item.id)}
        submitLabel="Save changes"
        initial={{
          kind: item.kind,
          name: item.name,
          keyDate: item.key_date,
          repeat: repeatValue(item.recurrence_unit, item.recurrence_interval),
          amount: item.amount === null ? '' : String(item.amount),
          currency: item.currency,
          notes: item.notes ?? '',
        }}
      />
      <form
        action={deleteItem.bind(null, item.id)}
        className="border-line mt-12 border-t pt-6"
      >
        <DeleteButton name={item.name} />
      </form>
    </div>
  );
}
