import { requireUser } from '@/lib/server/auth';

export default async function AppHome() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="font-serif text-4xl font-light">Upcoming</h1>
      <p className="text-ink-soft mt-3 text-[15px]">
        Signed in as {user.email}. Your items will appear here.
      </p>
    </div>
  );
}
