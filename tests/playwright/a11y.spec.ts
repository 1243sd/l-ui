import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('shell has no accessibility violations', async ({ page }) => {
  await page.goto('/?scenario=shell&theme=light&motion=off');
  await expect(page.getByTestId('qa-shell')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test('pro-basic has no accessibility violations', async ({ page }) => {
  await page.goto('/?scenario=pro-basic&theme=light&motion=off');
  await expect(page.getByTestId('qa-pro-basic')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
