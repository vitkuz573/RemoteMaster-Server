import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('login page has no critical a11y issues', async ({ page }) => {
  await page.goto('/login');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  const critical = accessibilityScanResults.violations.filter(v => (v.impact || '').toLowerCase() === 'critical');
  expect(critical).toEqual([]);
});

