import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('https://portal.avihsbuilders.com/login');
  await page.getByTestId('login-email').fill('jyotiprakash.behera@avihs.ai');
  await page.getByTestId('login-password').fill('LightOfJyoti67!');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('https://portal.avihsbuilders.com/dashboard');
  await page.context().storageState({ path: authFile });
});
