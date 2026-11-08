import { defineConfig } from 'vitest/config';

// Unit tests only. Database tests live in supabase/tests (npm run test:db).
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
