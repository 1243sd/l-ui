import { expect, test } from '@playwright/test';

test('consumer smoke app installs from tarballs and renders the published surfaces', async ({
  page
}) => {
  await page.goto('/');

  await expect(page.getByTestId('consumer-smoke-root')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-lolita-theme', 'dark');
  await expect(page.getByTestId('consumer-theme-token')).toContainText('#ff6b81');

  const primaryAction = page.getByTestId('consumer-primary-action');
  await expect(primaryAction).toBeVisible();
  await expect(primaryAction).toHaveCSS('display', 'flex');

  const consumerTable = page.getByTestId('consumer-pro-table');
  await expect(consumerTable.getByText('Alice')).toBeVisible();

  await consumerTable.getByPlaceholder('Search member').fill('Diego');
  await page.getByTestId('pro-search-submit').click();
  await expect(consumerTable.getByText('Diego')).toBeVisible();
  await expect(consumerTable.getByText('Alice')).toHaveCount(0);

  await page.getByTestId('pro-search-reset').click();
  await expect(consumerTable.getByText('Alice')).toBeVisible();

  await consumerTable.getByRole('button', { name: '2' }).click();
  await expect(consumerTable.getByText('Celine')).toBeVisible();
});
