import { NextResponse, type NextRequest } from 'next/server';
import { createUserClient } from '@/lib/server/supabase-user';

export async function POST(request: NextRequest) {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
