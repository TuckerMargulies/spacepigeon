import { defineConfig, devices } from '@playwright/test';

const STUB = 'http://localhost:8788';

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  workers: 1, // software WebGL is CPU-bound; parallel tests starve each other
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8000',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    // Software WebGL on CI runners (no GPU).
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: [
    {
      // Stands in for Supabase and Resend: tests never hit real services.
      command: 'node e2e/support/stub-services.mjs',
      url: `${STUB}/__state`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/dev-server.mjs',
      url: 'http://localhost:8000',
      reuseExistingServer: !process.env.CI,
      env: {
        SUPABASE_URL: STUB,
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        resend_key: 'test-resend-key',
        RESEND_API_URL: STUB,
        SESSION_SECRET: 'test-session-secret-that-is-at-least-32-chars',
        ADMIN_EMAILS: 'admin@coalesce.nyc',
        ORDER_CC: 'admin@coalesce.nyc',
        SITE_URL: 'http://localhost:8000',
      },
    },
  ],
});
