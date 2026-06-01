import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command:
      'cmd /c "pnpm --filter @lolita-ui/playground build && pnpm --filter @lolita-ui/playground exec vite preview --host 127.0.0.1 --port 4173 --strictPort"',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'e2e',
      testMatch: /.*e2e\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'visual',
      testMatch: /.*visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'a11y',
      testMatch: /.*a11y\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
