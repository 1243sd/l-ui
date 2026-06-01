import { expect, test } from '@playwright/test';

const requiredScenarios = [
  ['shell', 'light'],
  ['shell', 'dark'],
  ['overlay-modal', 'light'],
  ['overlay-modal', 'dark'],
  ['pro-basic', 'light'],
  ['pro-basic', 'dark']
] as const;

for (const [scenario, theme] of requiredScenarios) {
  test(`${scenario}-${theme}`, async ({ page }) => {
    await page.goto(`/?scenario=${scenario}&theme=${theme}&motion=off`);

    const rootTestId =
      scenario === 'overlay-modal'
        ? 'qa-overlay-modal'
        : scenario === 'pro-basic'
          ? 'qa-pro-basic'
          : 'qa-shell';

    await expect(page.getByTestId(rootTestId)).toBeVisible();
    await expect(page).toHaveScreenshot(`${scenario}-${theme}.png`);
  });
}
