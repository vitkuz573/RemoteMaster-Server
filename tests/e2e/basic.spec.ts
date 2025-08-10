import { test, expect } from '@playwright/test';

test('home redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/RemoteMaster/i);
  await expect(page.getByText(/Sign in to your organization/i)).toBeVisible();
});

