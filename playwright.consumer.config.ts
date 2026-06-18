import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  testMatch: /.*consumer\.spec\.ts/,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'cmd /c "pnpm consumer:build && pnpm consumer:preview"',
    port: 4174,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'consumer',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
