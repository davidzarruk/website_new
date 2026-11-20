import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8796', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 5'], browserName: 'chromium' } },
    { name: 'webkit', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npx vite --config e2e/finance-responsive/vite.config.ts',
    url: 'http://127.0.0.1:8796',
    reuseExistingServer: !process.env.CI,
  },
});
