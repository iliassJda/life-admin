import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';

/** Opens the item's stored document through a link that expires in a minute. */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/app/items/[id]/document'>,
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  // Row-level security limits this to the person's own items.
  const { data: item } = await user.supabase
    .from('items')
    .select('file_path')
    .eq('id', id)
    .maybeSingle();
  if (!item?.file_path) {
    return NextResponse.redirect(new URL(`/app/items/${id}`, request.url));
  }

  const { data } = await user.supabase.storage
    .from('documents')
    .createSignedUrl(item.file_path, 60);
  if (!data?.signedUrl) {
    return NextResponse.redirect(new URL(`/app/items/${id}`, request.url));
  }
  return NextResponse.redirect(data.signedUrl, {
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}
