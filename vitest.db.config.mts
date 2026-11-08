import { defineConfig } from 'vitest/config';

// Runs against the local Supabase started with `npm run db:start`.
export default defineConfig({
  test: { include: ['supabase/tests/**/*.test.ts'], testTimeout: 20_000 },
});
