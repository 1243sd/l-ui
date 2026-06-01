import { expect, test } from '@playwright/test';

test.describe('playground QA shell', () => {
  test('loads shell scenario in light mode', async ({ page }) => {
    await page.goto('/?scenario=shell&theme=light&motion=off');
    await expect(page.getByTestId('qa-shell')).toBeVisible();
  });

  test('opens modal scenario directly by URL', async ({ page }) => {
    await page.goto('/?scenario=overlay-modal&theme=dark&motion=off');
    await expect(page.getByTestId('qa-overlay-modal')).toBeVisible();
  });

  test('loads Pro scenario directly by URL', async ({ page }) => {
    await page.goto('/?scenario=pro-basic&theme=light&motion=off');
    await expect(page.getByTestId('qa-pro-basic')).toBeVisible();
  });

  test('submits, resets, and paginates in pro-basic', async ({ page }) => {
    await page.goto('/?scenario=pro-basic&theme=light&motion=off');
    const proSection = page.getByTestId('qa-pro-basic');

    await expect(proSection.getByText('Alice')).toBeVisible();

    await proSection.getByPlaceholder('按成员名称筛选').fill('Gina');
    await page.getByTestId('pro-search-submit').click();
    await expect(proSection.getByText('Gina')).toBeVisible();
    await expect(proSection.getByText('Alice')).toHaveCount(0);

    await page.getByTestId('pro-search-reset').click();
    await expect(proSection.getByText('Alice')).toBeVisible();

    await proSection.getByRole('button', { name: '2' }).click();
    await expect(proSection.getByText('Hugo')).toBeVisible();
    await expect(proSection.getByText('Alice')).toHaveCount(0);
  });

  test('recovers from the injected pro-error scenario by retrying', async ({ page }) => {
    await page.goto('/?scenario=pro-error&theme=light&motion=off');

    await expect(page.getByTestId('qa-pro-error')).toBeVisible();
    await expect(page.getByText('请求失败，请重试。')).toBeVisible();

    await page.getByTestId('pro-search-retry').click();
    await expect(page.getByText('Alice')).toBeVisible();
  });
});
