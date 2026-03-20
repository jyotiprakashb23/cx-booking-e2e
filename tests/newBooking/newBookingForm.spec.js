// =============================================================================
// AVIHS Builders – New Booking Form Tests
// Page: https://portal.avihsbuilders.com/dashboard/new-booking
// =============================================================================

import 'dotenv/config';
import { test, expect } from '@playwright/test';

const BASE_URL    = 'https://portal.avihsbuilders.com';
const BOOKING_URL = `${BASE_URL}/dashboard/new-booking`;

// ---------------------------------------------------------------------------
// Login helper
// ---------------------------------------------------------------------------
  async function login(page) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByTestId('login-email').waitFor({ state: 'visible' });
    await page.getByTestId('login-email').fill(process.env.EMAIL_ID);
    await page.getByTestId('login-password').waitFor({ state: 'visible' });
    await page.getByTestId('login-password').fill(process.env.PASSWORD);
    await page.getByTestId('login-submit').waitFor({ state: 'visible' });
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000, waitUntil: 'commit' });
  }

// ---------------------------------------------------------------------------
// Open the new booking form before every test
// ---------------------------------------------------------------------------
test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto(BOOKING_URL);
  await page.getByTestId('field-first-name').waitFor({ state: 'visible', timeout: 30000 });
});

// ===========================================================================
// 1. FORM VISIBILITY
// ===========================================================================

test.describe('Form visibility', () => {

  test('Customer Details section shows all fields', async ({ page }) => {
    await expect(page.getByTestId('field-first-name')).toBeVisible();
    await expect(page.getByTestId('field-middle-name')).toBeVisible();
    await expect(page.getByTestId('field-last-name')).toBeVisible();
    await expect(page.getByTestId('field-mobile')).toBeVisible();
    await expect(page.getByTestId('field-secondary-mobile')).toBeVisible();
    await expect(page.getByTestId('field-email')).toBeVisible();
    await expect(page.getByTestId('field-address')).toBeVisible();
  });

  test('Property Details section shows all fields', async ({ page }) => {
    await expect(page.getByTestId('field-project-select')).toBeVisible();
    await expect(page.getByTestId('field-plot')).toBeVisible();
    await expect(page.getByTestId('field-plot-size')).toBeVisible();
    await expect(page.getByTestId('field-prop-value')).toBeVisible();
    await expect(page.getByTestId('field-booking-date')).toBeVisible();
  });

  test('Payment Details section shows all fields', async ({ page }) => {
    await expect(page.getByTestId('field-amount')).toBeVisible();
    await expect(page.getByTestId('field-amount-words')).toBeVisible();
    await expect(page.getByTestId('field-pay-mode')).toBeVisible();
    await expect(page.getByTestId('field-txn-no')).toBeVisible();
    await expect(page.getByTestId('field-bank')).toBeVisible();
  });

  test('Save and Clear buttons are visible', async ({ page }) => {
    await expect(page.getByTestId('submit-booking')).toBeVisible();
    await expect(page.getByTestId('clear-form')).toBeVisible();
  });

  test('Save button label is correct', async ({ page }) => {
    await expect(page.getByTestId('submit-booking')).toHaveText('Save booking & generate receipt');
  });

  test('Project dropdown has Hemant Vihar and Dev Nagar options', async ({ page }) => {
    const select = page.getByTestId('field-project-select');
    await expect(select.locator('option[value="Hemant Vihar"]')).toBeAttached();
    await expect(select.locator('option[value="Dev Nagar"]')).toBeAttached();
  });

  test('Payment mode dropdown has Cash, NEFT, RTGS and UPI options', async ({ page }) => {
    const select = page.getByTestId('field-pay-mode');
    for (const mode of ['Cash', 'NEFT', 'RTGS', 'UPI']) {
      await expect(select.locator(`option[value="${mode}"]`)).toBeAttached();
    }
  });

});

// ===========================================================================
// 2. REQUIRED FIELD VALIDATION
// ===========================================================================

// test.describe('Required field validation', () => {

//   test('Empty submit shows: Missing required field: first_name', async ({ page }) => {
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toBeVisible();
//     await expect(page.getByTestId('booking-error')).toContainText('first_name');
//     await expect(page).toHaveURL(BOOKING_URL);
//   });

//   test('Missing last_name shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('last_name');
//   });

//   test('Missing mobile shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('mobile');
//   });

//   test('Missing project shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('project');
//   });

//   test('Missing plot shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await page.getByTestId('field-plot').waitFor({ state: 'visible' });
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('plot');
//   });

//   test('Missing property value shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await page.getByTestId('field-plot').waitFor({ state: 'visible' });
//     await page.getByTestId('field-plot').selectOption('B-2');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('prop_value');
//   });

//   test('Missing booking date shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await page.getByTestId('field-plot').waitFor({ state: 'visible' });
//     await page.getByTestId('field-plot').selectOption('B-2');
//     await page.getByTestId('field-prop-value').fill('1500000');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('booking_date');
//   });

//   test('Missing amount shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await page.getByTestId('field-plot').waitFor({ state: 'visible' });
//     await page.getByTestId('field-plot').selectOption('B-2');
//     await page.getByTestId('field-prop-value').fill('1500000');
//     await page.getByTestId('field-booking-date').fill('2026-03-20');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('amount');
//   });

//   test('Missing payment mode shows validation error', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya');
//     await page.getByTestId('field-last-name').fill('Patel');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await page.getByTestId('field-plot').waitFor({ state: 'visible' });
//     await page.getByTestId('field-plot').selectOption('B-2');
//     await page.getByTestId('field-prop-value').fill('1500000');
//     await page.getByTestId('field-booking-date').fill('2026-03-20');
//     await page.getByTestId('field-amount').fill('50000');
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByTestId('booking-error')).toContainText('pay_mode');
//   });

//   test('Validation error has role="alert"', async ({ page }) => {
//     await page.getByTestId('submit-booking').click();
//     await expect(page.getByRole('alert')).toBeVisible();
//   });

// });

// ===========================================================================
// 3. FIELD INPUT BEHAVIOUR
// ===========================================================================

// test.describe('Field input behaviour', () => {

//   test('First name accepts letters and spaces', async ({ page }) => {
//     await page.getByTestId('field-first-name').fill('Priya Devi');
//     await expect(page.getByTestId('field-first-name')).toHaveValue('Priya Devi');
//   });

//   test('Mobile field enforces 10-digit maxlength', async ({ page }) => {
//     await page.getByTestId('field-mobile').fill('98765432109999');
//     const value = await page.getByTestId('field-mobile').inputValue();
//     expect(value.length).toBeLessThanOrEqual(10);
//   });

//   test('Mobile field only accepts digits', async ({ page }) => {
//     await page.getByTestId('field-mobile').pressSequentially('abc!@#xyz');
//     const value = await page.getByTestId('field-mobile').inputValue();
//     expect(value).toMatch(/^[0-9]*$/);
//   });

//   test('Secondary mobile field enforces 10-digit maxlength', async ({ page }) => {
//     await page.getByTestId('field-secondary-mobile').fill('98765432109999');
//     const value = await page.getByTestId('field-secondary-mobile').inputValue();
//     expect(value.length).toBeLessThanOrEqual(10);
//   });

//   test('Property value field rejects alphabetic input', async ({ page }) => {
//     await page.getByTestId('field-prop-value').pressSequentially('abcXYZ');
//     const value = await page.getByTestId('field-prop-value').inputValue();
//     expect(value).toBe('');
//   });

//   test('Amount field rejects alphabetic input', async ({ page }) => {
//     await page.getByTestId('field-amount').pressSequentially('abcXYZ');
//     const value = await page.getByTestId('field-amount').inputValue();
//     expect(value).toBe('');
//   });

//   test('Email field accepts a valid email address', async ({ page }) => {
//     await page.getByTestId('field-email').fill('priya.patel@example.com');
//     await expect(page.getByTestId('field-email')).toHaveValue('priya.patel@example.com');
//   });

//   test('Address field accepts text input', async ({ page }) => {
//     await page.getByTestId('field-address').fill('Bhubaneswar, Odisha');
//     await expect(page.getByTestId('field-address')).toHaveValue('Bhubaneswar, Odisha');
//   });

//   test('Plot-size field is read-only', async ({ page }) => {
//     await expect(page.getByTestId('field-plot-size')).toHaveAttribute('placeholder', 'Auto-filled from plot');
//     await page.getByTestId('field-plot-size').fill('manual override');
//     const value = await page.getByTestId('field-plot-size').inputValue();
//     expect(value).toBe('');
//   });

//   test('Amount-in-words field is read-only', async ({ page }) => {
//     await expect(page.getByTestId('field-amount-words')).toHaveAttribute('placeholder', 'Auto-filled');
//   });

// });

// ===========================================================================
// 4. PROJECT → PLOT DEPENDENCY
// ===========================================================================

// test.describe('Project → Plot dependency', () => {

//   test('Plot dropdown shows placeholder before project is selected', async ({ page }) => {
//     await expect(page.getByTestId('field-plot').locator('option').first()).toHaveText('Select project first');
//   });

//   test('Selecting Hemant Vihar loads its plots', async ({ page }) => {
//     await page.getByTestId('field-project-select').selectOption('Hemant Vihar');
//     await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//     const options = await page.getByTestId('field-plot').locator('option').allTextContents();
//     expect(options.some(o => o.includes('Plot'))).toBe(true);
//   });

//   test('Selecting Dev Nagar loads its plots', async ({ page }) => {
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//     const options = await page.getByTestId('field-plot').locator('option').allTextContents();
//     expect(options.some(o => o.includes('Plot A-') || o.includes('Plot B-') || o.includes('Plot C-'))).toBe(true);
//   });

//   test('Selecting a plot auto-fills the plot size', async ({ page }) => {
//     await page.getByTestId('field-project-select').selectOption('Hemant Vihar');
//     await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//     await page.getByTestId('field-plot').selectOption('81');
//     await expect(page.getByTestId('field-plot-size')).not.toHaveValue('');
//     const size = await page.getByTestId('field-plot-size').inputValue();
//     expect(size).toMatch(/sq\.ft\./);
//   });

//   test('Switching project resets plot selection', async ({ page }) => {
//     await page.getByTestId('field-project-select').selectOption('Hemant Vihar');
//     await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//     await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//     await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//     const plotValue = await page.getByTestId('field-plot').inputValue();
//     expect(plotValue).toBe('');
//   });

// });

// ===========================================================================
// 5. AMOUNT IN WORDS AUTO-FILL
// ===========================================================================

test.describe('Amount in words auto-fill', () => {

  test('Entering 50000 auto-fills amount in words', async ({ page }) => {
    await page.getByTestId('field-amount').fill('50000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByTestId('field-amount-words')).not.toHaveValue('');
    const words = await page.getByTestId('field-amount-words').inputValue();
    expect(words.toLowerCase()).toMatch(/fifty thousand/);
  });

  test('Entering 100000 auto-fills One Lakh', async ({ page }) => {
    await page.getByTestId('field-amount').fill('100000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByTestId('field-amount-words')).not.toHaveValue('');
    const words = await page.getByTestId('field-amount-words').inputValue();
    expect(words.toLowerCase()).toMatch(/lakh|lac|hundred thousand/);
  });

  test('Clearing amount clears amount in words', async ({ page }) => {
    await page.getByTestId('field-amount').fill('50000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByTestId('field-amount-words')).not.toHaveValue('');
    await page.getByTestId('field-amount').fill('');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByTestId('field-amount-words')).toHaveValue('');
  });

});

// ===========================================================================
// 6. CLEAR BUTTON
// ===========================================================================

test.describe('Clear button', () => {

  test('Clear button resets all text fields', async ({ page }) => {
    await page.getByTestId('field-first-name').fill('Priya');
    await page.getByTestId('field-last-name').fill('Patel');
    await page.getByTestId('field-mobile').fill('9876543210');
    await page.getByTestId('field-email').fill('priya@example.com');
    await page.getByTestId('field-amount').fill('75000');
    await page.getByTestId('clear-form').click();
    await expect(page.getByTestId('field-first-name')).toHaveValue('');
    await expect(page.getByTestId('field-last-name')).toHaveValue('');
    await expect(page.getByTestId('field-mobile')).toHaveValue('');
    await expect(page.getByTestId('field-email')).toHaveValue('');
    await expect(page.getByTestId('field-amount')).toHaveValue('');
  });

  test('Clear button resets dropdowns to defaults', async ({ page }) => {
    await page.getByTestId('field-project-select').selectOption('Dev Nagar');
    await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
    await page.getByTestId('field-pay-mode').selectOption('UPI');
    await page.getByTestId('clear-form').click();
    await expect(page.getByTestId('field-project-select')).toHaveValue('');
    await expect(page.getByTestId('field-pay-mode')).toHaveValue('');
  });

  test('Clear button resets amount and amount in words', async ({ page }) => {
    await page.getByTestId('field-amount').fill('50000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByTestId('field-amount-words')).not.toHaveValue('');
    await page.getByTestId('clear-form').click();
    await expect(page.getByTestId('field-amount')).toHaveValue('');
    await expect(page.getByTestId('field-amount-words')).toHaveValue('');
  });

});

// ===========================================================================
// 7. SUCCESSFUL FORM SUBMISSION
// ===========================================================================

// test('Valid form submission redirects to receipt page', async ({ page }) => {
//   await page.getByTestId('field-first-name').fill('Test');
//   await page.getByTestId('field-last-name').fill('User');
//   await page.getByTestId('field-mobile').fill('9000000001');
//   await page.getByTestId('field-email').fill('test.user@example.com');
//   await page.getByTestId('field-address').fill('Bhubaneswar, Odisha');
//   await page.getByTestId('field-project-select').selectOption('Dev Nagar');
//   await expect(page.getByTestId('field-plot').locator('option').nth(1)).toBeAttached();
//   await page.getByTestId('field-plot').selectOption('B-2');
//   await page.getByTestId('field-prop-value').fill('1500000');
//   await page.getByTestId('field-booking-date').fill('2026-03-20');
//   await page.getByTestId('field-amount').fill('50000');
//   await page.getByTestId('field-amount').press('Tab');
//   await expect(page.getByTestId('field-amount-words')).not.toHaveValue('');
//   await page.getByTestId('field-pay-mode').selectOption('Cash');
//   await page.getByTestId('submit-booking').click();
//   await expect(page).toHaveURL(/\/dashboard\/receipt\//, { timeout: 30000 });
// });
