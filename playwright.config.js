import { defineConfig, devices } from '@playwright/test';

// Browser tests for the gestures unit tests cannot reach. Runs against a
// production build served locally, or against BASE_URL when it is set
// (for example a Vercel preview).
const baseURL = process.env.BASE_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run build && npm run preview -- --port 4173 --strictPort', url: baseURL, reuseExistingServer: true },
});
