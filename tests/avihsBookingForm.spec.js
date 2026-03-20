// =============================================================================
// AVIHS Builders – New Booking Form Tests
// Page: https://avihs-portal.itadmin-b27.workers.dev/dashboard/new-booking
// =============================================================================

import { test, expect } from '@playwright/test';

const BASE_URL    = 'https://avihs-portal.itadmin-b27.workers.dev';
const BOOKING_URL = `${BASE_URL}/dashboard/new-booking`;

// ---------------------------------------------------------------------------
// Login helper (needed to reach the form)
// ---------------------------------------------------------------------------
async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByTestId('login-email').fill(process.env.EMAIL_ID);
  await page.waitForTimeout(500);
  await page.getByTestId('login-password').fill(process.env.PASSWORD);
  await page.waitForTimeout(500);
  await page.getByTestId('login-submit').click();
  await page.waitForTimeout(500);

  // Debug: wait 5 seconds and check where we are
  await page.waitForTimeout(5000);

  await page.waitForURL(/\/dashboard/, { timeout: 60000 }); // ← wait for redirect FIRST
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 }); // ← wait for page to settle
  await page.getByTestId('tab-new-booking').waitFor({ state: 'visible', timeout: 60000 });
}
// ---------------------------------------------------------------------------
// Open the form before every test 
// ---------------------------------------------------------------------------
test.beforeEach(async ({ page }) => {
  // await page.pause()
  await login(page);
  await page.goto(BOOKING_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.getByTestId('field-cust-name').waitFor({ state: 'visible', timeout: 30000 }); // ← wait for form
});

// ===========================================================================
// 1. FORM FIELDS – visibility & placeholders
// ===========================================================================

test('Form shows all Customer Details fields', async ({ page }) => {
  await expect(page.getByTestId('field-cust-name')).toBeVisible();
  await expect(page.getByTestId('field-mobile')).toBeVisible();
  await expect(page.getByTestId('field-email')).toBeVisible();
  await expect(page.getByTestId('field-address')).toBeVisible();
});

test('Form shows all Property Details fields', async ({ page }) => {
  await expect(page.getByTestId('field-project')).toBeVisible();
  await expect(page.getByTestId('field-plot')).toBeVisible();
  await expect(page.getByTestId('field-area')).toBeVisible();
  await expect(page.getByTestId('field-prop-value')).toBeVisible();
  await expect(page.getByTestId('field-towards-select')).toBeVisible();
});

test('Form shows all Payment Details fields', async ({ page }) => {
  await expect(page.getByTestId('field-amount')).toBeVisible();
  await expect(page.getByPlaceholder('Auto-filled')).toBeVisible();
  await expect(page.getByTestId('field-pay-mode')).toBeVisible();
  await expect(page.getByTestId('field-txn-no')).toBeVisible();
  await expect(page.getByTestId('field-bank')).toBeVisible();
});

test('Form has Save and Clear buttons', async ({ page }) => {
  await expect(page.getByTestId('submit-booking')).toBeVisible();
  await expect(page.getByTestId('clear-form')).toBeVisible();
});

// ===========================================================================
// 2. REQUIRED FIELD VALIDATION
// ===========================================================================

// test('Empty form submit shows: Missing required field: cust_name', async ({ page }) => {
//   await page.getByTestId('submit-booking').click();
//   await expect(page.getByRole('alert')).toContainText('Missing required field: cust_name');
//   await expect(page).toHaveURL(BOOKING_URL);
// });

// test('Only name filled shows: Missing required field: mobile', async ({ page }) => {
//   await page.getByTestId('field-cust-name').fill('Rahul Sharma');
//   await page.getByTestId('submit-booking').click();
//   await expect(page.getByRole('alert')).toContainText('Missing required field: mobile');
//   await expect(page).toHaveURL(BOOKING_URL);
// });

// test('Name + mobile filled shows: Missing required field: project', async ({ page }) => {
//   await page.getByTestId('field-cust-name').fill('Rahul Sharma');
//   await page.getByTestId('field-mobile').fill('9876543210');
//   await page.getByTestId('submit-booking').click();
//   await expect(page.getByRole('alert')).toContainText('Missing required field: project');
//   await expect(page).toHaveURL(BOOKING_URL);
// });

// ===========================================================================
// 3. FIELD INPUT BEHAVIOUR
// ===========================================================================

// test('Customer name field accepts text input', async ({ page }) => {
//   await page.getByTestId('field-cust-name').fill('Priya Patel');
//   await expect(page.getByTestId('field-cust-name')).toHaveValue('Priya Patel');
// });

// test('Mobile field accepts numeric input', async ({ page }) => {
//   await page.getByTestId('field-mobile').fill('9876543210');
//   await expect(page.getByTestId('field-mobile')).toHaveValue('9876543210');
// });

// test('Email field accepts email input', async ({ page }) => {
//   await page.getByTestId('field-email').fill('priya@example.com');
//   await expect(page.getByTestId('field-email')).toHaveValue('priya@example.com');
// });

// test('Address field accepts text input', async ({ page }) => {
//   await page.getByTestId('field-address').fill('Bhubaneswar, Odisha');
//   await expect(page.getByTestId('field-address')).toHaveValue('Bhubaneswar, Odisha');
// });

// test('[BUG] Short mobile number (5 digits) passes validation - no format check', async ({ page }) => {
//   // EXPECTED: Should reject invalid mobile. ACTUAL: Moves to next field error.
//   await page.getByTestId('field-cust-name').fill('Test User');
//   await page.getByTestId('field-mobile').fill('12345');
//   await page.getByTestId('submit-booking').click();
//   // Bug: alert is about the next field, not about mobile format
//   await expect(page.getByRole('alert')).not.toContainText('mobile');
// });

// test('[BUG] Invalid email format is accepted without validation', async ({ page }) => {
//   // EXPECTED: Should reject "not-an-email". ACTUAL: Form submits successfully.
//   await page.getByTestId('field-cust-name').fill('Rahul Sharma');
//   await page.getByTestId('field-mobile').fill('9876543210');
//   await page.getByTestId('field-email').fill('not-an-email');
//   await page.getByTestId('field-project').fill('Green Valley');
//   await page.getByTestId('field-plot').fill('B-204');
//   await page.getByTestId('field-prop-value').fill('2500000');
//   await page.getByTestId('field-amount').fill('50000');
//   await page.getByTestId('field-pay-mode').selectOption('Cash');
//   await page.getByTestId('submit-booking').click();
//   // Bug: redirects to receipt instead of showing email error
//   await expect(page).not.toHaveURL(BOOKING_URL);
// });

// ===========================================================================
// 4. TOWARDS DROPDOWN – dynamic "Describe purpose" field
// ===========================================================================

// test('Towards dropdown has all 5 options', async ({ page }) => {
//   const select = page.getByTestId('field-towards-select');
//   for (const option of ['Booking Amount', 'Token Amount', 'Part Payment', 'Full Payment', 'Custom…']) {
//     await expect(select.locator(`option:text("${option}")`)).toBeAttached();
//   }
// });

// test('Selecting "Custom…" reveals a "Describe purpose" input', async ({ page }) => {
//   await expect(page.getByPlaceholder('Describe purpose')).not.toBeVisible();
//   await page.getByTestId('field-towards-select').selectOption('Custom…');
//   await expect(page.getByPlaceholder('Describe purpose')).toBeVisible();
// });

// test('Switching away from "Custom…" hides the "Describe purpose" input', async ({ page }) => {
//   await page.getByTestId('field-towards-select').selectOption('Custom…');
//   await expect(page.getByPlaceholder('Describe purpose')).toBeVisible();
//   await page.getByTestId('field-towards-select').selectOption('Token Amount');
//   await expect(page.getByPlaceholder('Describe purpose')).not.toBeVisible();
// });

// test('[BUG] Custom Towards with empty description still submits', async ({ page }) => {
//   // EXPECTED: Should require "Describe purpose" text. ACTUAL: Submits anyway.
//   await page.getByTestId('field-cust-name').fill('Rahul Sharma');
//   await page.getByTestId('field-mobile').fill('9876543210');
//   await page.getByTestId('field-project').fill('Green Valley');
//   await page.getByTestId('field-plot').fill('B-204');
//   await page.getByTestId('field-prop-value').fill('2500000');
//   await page.getByTestId('field-towards-select').selectOption('Custom…');
//   // Leave "Describe purpose" blank intentionally
//   await page.getByTestId('field-amount').fill('50000');
//   await page.getByTestId('field-pay-mode').selectOption('UPI');
//   await page.getByTestId('submit-booking').click();
//   // Bug: receipt page loads instead of showing a validation error
//   await expect(page.locator('text=Booking confirmed')).toBeVisible();
// });

// ===========================================================================
// 5. AMOUNT IN WORDS – auto-fill
// ===========================================================================

// test('Amount in words auto-fills when amount is entered', async ({ page }) => {
//   await page.getByTestId('field-amount').fill('50000');
//   await page.getByTestId('field-amount').press('Tab');
//   await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('Fifty Thousand Rupees Only');
// });

// test('Amount in words updates when amount changes', async ({ page }) => {
//   await page.getByTestId('field-amount').fill('100000');
//   await page.getByTestId('field-amount').press('Tab');
//   await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('One Lakh Rupees Only');

//   await page.getByTestId('field-amount').fill('25000');
//   await page.getByTestId('field-amount').press('Tab');
//   await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('Twenty Five Thousand Rupees Only');
// });

// ===========================================================================
// 6. CLEAR BUTTON
// ===========================================================================

// test('Clear button resets all fields to empty', async ({ page }) => {
//   await page.getByTestId('field-cust-name').fill('Test User');
//   await page.getByTestId('field-mobile').fill('9999999999');
//   await page.getByTestId('field-email').fill('test@example.com');
//   await page.getByTestId('field-project').fill('Test Project');
//   await page.getByTestId('field-amount').fill('75000');

//   await page.getByTestId('clear-form').click();

//   await expect(page.getByTestId('field-cust-name')).toHaveValue('');
//   await expect(page.getByTestId('field-mobile')).toHaveValue('');
//   await expect(page.getByTestId('field-email')).toHaveValue('');
//   await expect(page.getByTestId('field-project')).toHaveValue('');
//   await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('');
// });

// test('Clear button resets dropdowns to their defaults', async ({ page }) => {
//   await page.getByTestId('field-towards-select').selectOption('Full Payment');
//   await page.getByTestId('field-pay-mode').selectOption('Cheque');

//   await page.getByTestId('clear-form').click();

//   await expect(page.getByTestId('field-towards-select')).toHaveValue('Booking Amount');
//   await expect(page.getByTestId('field-pay-mode')).toHaveValue('');
//   await expect(page.getByTestId('field-pay-mode')).toHaveText(/Select mode/);
// });

// ===========================================================================
// 7. SUCCESSFUL FORM SUBMISSION
// ===========================================================================

// test('Valid form submission redirects to receipt page', async ({ page }) => {
//   // await page.pause()
//   await page.getByTestId('field-cust-name').fill('Rahul Sharma');
//   await page.getByTestId('field-mobile').fill('9876543210');
//   await page.getByTestId('field-email').fill('rahul.sharma@example.com');
//   await page.getByTestId('field-address').fill('Bhubaneswar, Odisha');
//   await page.getByTestId('field-project').fill('Green Valley Phase 2');
//   await page.getByTestId('field-plot').fill('B-204');
//   await page.getByTestId('field-area').fill('1200');
//   await page.getByTestId('field-prop-value').fill('2500000');
//   await page.getByTestId('field-towards-select').selectOption('Booking Amount');
//   await page.getByTestId('field-amount').fill('50000');
//   await page.getByTestId('field-pay-mode').selectOption('UPI');
//   await page.getByTestId('field-txn-no').fill('UPI123456789');
//   await page.getByTestId('field-bank').fill('HDFC Bank');

//   await page.getByTestId('submit-booking').click();

//   await expect(page).toHaveURL(/\/dashboard\/receipt\//);
//   await expect(page.locator('text=Booking confirmed')).toBeVisible();
// });
