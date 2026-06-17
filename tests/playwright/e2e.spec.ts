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

  test('supports range query, sort, reset, and pagination in pro-basic', async ({ page }) => {
    await page.goto('/?scenario=pro-basic&theme=light&motion=off');
    const proSection = page.getByTestId('qa-pro-basic');

    await expect(proSection.getByText('Alice')).toBeVisible();

    await proSection.locator('.l-date-range-picker').click();
    await page.getByRole('button', { name: 'Previous month' }).click();
    await page.locator('[data-date="2026-05-20"]').click();
    await page.locator('[data-date="2026-05-26"]').click();
    await page.getByTestId('pro-search-submit').click();

    await expect(proSection.getByText('Gina')).toBeVisible();
    await expect(proSection.getByText('Alice')).toHaveCount(0);

    await proSection.locator('[data-column-key="name"]').click();
    await proSection.locator('[data-column-key="name"]').click();
    await expect(proSection.getByText('Gina')).toBeVisible();
    await expect(proSection.getByText('Derek')).toBeVisible();

    await page.getByTestId('pro-search-reset').click();
    await expect(proSection.getByText('Alice')).toBeVisible();

    await proSection.getByRole('button', { name: '2' }).click();
    await expect(proSection.getByText('Hugo')).toBeVisible();
    await expect(proSection.getByText('Alice')).toHaveCount(0);
  });

  test('clears single-date and date-range filters on the first click in pro-basic', async ({ page }) => {
    await page.goto('/?scenario=pro-basic&theme=light&motion=off');
    const proSection = page.getByTestId('qa-pro-basic');

    const singleDate = proSection.locator('.l-date-picker-wrapper').first();
    await singleDate.locator('.l-date-picker').click();
    await page.locator('.l-date-picker-dropdown [data-date="2026-06-09"]').click();
    await expect(singleDate.locator('.l-date-picker__value')).toHaveText('2026-06-09');

    await singleDate.hover();
    await singleDate.locator('.l-date-picker__clear').click();
    await expect(singleDate.locator('.l-date-picker__value')).not.toHaveText('2026-06-09');

    const dateRange = proSection.locator('.l-date-range-picker-wrapper').first();
    await dateRange.locator('.l-date-range-picker').click();
    await page.locator('.l-date-range-picker-dropdown [data-date="2026-06-02"]').click();
    await page.locator('.l-date-range-picker-dropdown [data-date="2026-06-06"]').click();
    await expect(dateRange.locator('.l-date-range-picker__value')).toHaveText(
      '2026-06-02 ~ 2026-06-06'
    );

    await dateRange.locator('.l-date-range-picker').click();
    await page.locator('.l-date-range-picker-dropdown [data-date="2026-06-16"]').click();
    await dateRange.hover();
    await dateRange.locator('.l-date-range-picker__clear').click();
    await expect(dateRange.locator('.l-date-range-picker__value')).toHaveText('Select date range');
  });

  test('recovers from the injected pro-error scenario by retrying', async ({ page }) => {
    await page.goto('/?scenario=pro-error&theme=light&motion=off');

    await expect(page.getByTestId('qa-pro-error')).toBeVisible();
    await expect(page.getByText('请求失败，请重试。')).toBeVisible();

    await page.getByTestId('pro-search-retry').click();
    await expect(page.getByText('Alice')).toBeVisible();
  });
});
