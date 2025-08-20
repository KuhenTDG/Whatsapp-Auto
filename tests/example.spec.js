const { test, expect } = require('@playwright/test');

test('check title of Playwright website', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});

test('check heading text', async ({ page }) => {
  await page.goto('https://playwright.dev');
  const heading = await page.locator('h1');
  await expect(heading).toHaveText('Playwright');
});

/*test('this will fail on purpose', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle('Not The Real Title');
});*/
