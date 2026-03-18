/**
 * AVIHS Builders – New Booking Form Validation Tests
 * URL: https://avihs-portal.itadmin-b27.workers.dev/dashboard/new-booking
 *
 * Run with: npx playwright test avihs-booking-form-tests.js
 * (requires: npm install -D @playwright/test)
 */

import { test, expect } from '@playwright/test';

// ─── Helper: login as guest and land on New Booking ───────────────────────────
// async function gotoNewBooking(page) {
//   await page.goto('https://avihs-portal.itadmin-b27.workers.dev/dashboard');
//   await page.getByTestId('go-guest').click();
//   await page.getByTestId('guest-name').fill('Test User');
//   await page.getByTestId('guest-submit').click();
//   await page.getByTestId('tab-new-booking').click();
//   await expect(page).toHaveURL(/new-booking/);
// }
async function gotoNewBooking(page) {
  await page.goto('https://avihs-portal.itadmin-b27.workers.dev/guest');
  // await page.pause();
  await page.waitForURL(/login/)
  await page.getByTestId('guest-name').fill('Test User');
  await page.getByTestId('guest-submit').click();
  await page.waitForURL(/dashboard/);
  // await page.getByTestId('tab-new-booking').waitFor({ state: 'visible' });
  await page.getByTestId('tab-new-booking').click();
  await expect(page).toHaveURL(/new-booking/);
}

// ─── SECTION 1: Customer Name Field ───────────────────────────────────────────

test.describe('Customer Name Field', () => {

  test('should NOT allow special characters in name field', async ({ page }) => {
    await gotoNewBooking(page);
    const nameField = page.getByTestId('field-cust-name');

    await nameField.pressSequentially('John@#$%^&*()');

    // Expected: special characters are stripped or field shows error
    // CURRENT BEHAVIOUR (BUG): field accepts "John@#$%^&*()" — no validation
    const value = await nameField.inputValue();
    expect(value).not.toMatch(/[@#$%^&*()]/);   // ← this test WILL FAIL currently
  });

  test('should NOT allow numeric-only name', async ({ page }) => {
    await gotoNewBooking(page);
    const nameField = page.getByTestId('field-cust-name');

    await nameField.fill('12345');
    await page.getByTestId('submit-booking').click();

    // Expect an error message for invalid name
    const error = page.locator('[data-testid="error-cust-name"], .error, [role="alert"]');
    await expect(error).toBeVisible();
  });

  test('should allow valid name with letters and spaces', async ({ page }) => {
    await gotoNewBooking(page);
    const nameField = page.getByTestId('field-cust-name');

    await nameField.fill('Ramesh Kumar');
    const value = await nameField.inputValue();
    expect(value).toBe('Ramesh Kumar');
  });

  test('should allow hyphenated names (e.g. Mary-Jane)', async ({ page }) => {
    await gotoNewBooking(page);
    const nameField = page.getByTestId('field-cust-name');

    await nameField.fill('Mary-Jane Watson');
    const value = await nameField.inputValue();
    expect(value).toBe('Mary-Jane Watson');
  });

});

// ─── SECTION 2: Mobile Number Field ───────────────────────────────────────────

// test.describe('Mobile Number Field', () => {

//   test('should NOT allow letters in mobile number field', async ({ page }) => {
//     await gotoNewBooking(page);
//     const mobileField = page.getByTestId('field-mobile');

//     await mobileField.pressSequentially('abc!@#xyz');

//     // CURRENT BEHAVIOUR (BUG): field accepts letters — no validation
//     const value = await mobileField.inputValue();
//     expect(value).toMatch(/^[0-9+\s]*$/);   // ← this test WILL FAIL currently
//   });

//   test('should NOT allow mobile number shorter than 10 digits', async ({ page }) => {
//     await gotoNewBooking(page);
//     await page.getByTestId('field-mobile').fill('98765');
//     await page.getByTestId('submit-booking').click();

//     const error = page.locator('[data-testid="error-mobile"], .error, [role="alert"]');
//     await expect(error).toBeVisible();
//   });

//   test('should accept a valid 10-digit mobile number', async ({ page }) => {
//     await gotoNewBooking(page);
//     const mobileField = page.getByTestId('field-mobile');
//     await mobileField.fill('9876543210');
//     const value = await mobileField.inputValue();
//     expect(value).toBe('9876543210');
//   });

// });

// ─── SECTION 3: Amount Fields (spinbutton / number inputs) ────────────────────

// test.describe('Amount Fields – reject non-numeric input', () => {

//   test('Amount received: should NOT accept alphabetic characters', async ({ page }) => {
//     await gotoNewBooking(page);
//     const amountField = page.getByTestId('field-amount');

//     await amountField.pressSequentially('abcXYZ!!');

//     // HTML number inputs natively block letters — value should be empty
//     const value = await amountField.inputValue();
//     expect(value).toBe('');   // ← PASSES (browser blocks letters in spinbutton)
//   });

//   test('Amount received: should NOT accept negative values', async ({ page }) => {
//     await gotoNewBooking(page);
//     const amountField = page.getByTestId('field-amount');

//     await amountField.fill('-5000');
//     await page.getByTestId('submit-booking').click();

//     const error = page.locator('[data-testid="error-amount"], .error, [role="alert"]');
//     await expect(error).toBeVisible();
//   });

//   test('Amount received: should accept a valid positive number', async ({ page }) => {
//     await gotoNewBooking(page);
//     const amountField = page.getByTestId('field-amount');
//     await amountField.fill('50000');
//     expect(await amountField.inputValue()).toBe('50000');
//   });

//   test('Total property value: should NOT accept letters', async ({ page }) => {
//     await gotoNewBooking(page);
//     const propValueField = page.getByTestId('field-prop-value');

//     await propValueField.pressSequentially('abc123xyz');

//     // spinbutton should only retain numeric part "123"
//     const value = await propValueField.inputValue();
//     expect(value).toMatch(/^[0-9]*$/);   // ← PASSES
//   });

//   test('Area (sq.ft.): should NOT accept letters or special chars', async ({ page }) => {
//     await gotoNewBooking(page);
//     const areaField = page.getByTestId('field-area');

//     await areaField.pressSequentially('abc!@#');

//     const value = await areaField.inputValue();
//     expect(value).toBe('');   // ← PASSES (spinbutton blocks non-numeric)
//   });

// });

// ─── SECTION 4: Email Field ────────────────────────────────────────────────────

// test.describe('Email Field', () => {

//   test('should NOT accept invalid email format', async ({ page }) => {
//     await gotoNewBooking(page);
//     await page.getByTestId('field-email').fill('notanemail@@bad');
//     await page.getByTestId('submit-booking').click();

//     // Expect browser native or custom email validation error
//     const emailField = page.getByTestId('field-email');
//     const validationMessage = await emailField.evaluate(el => el.validationMessage);
//     expect(validationMessage).not.toBe('');   // browser should report invalid
//   });

//   test('should accept a valid email', async ({ page }) => {
//     await gotoNewBooking(page);
//     const emailField = page.getByTestId('field-email');
//     await emailField.fill('customer@example.com');
//     expect(await emailField.inputValue()).toBe('customer@example.com');
//   });

// });

// ─── SECTION 5: Required Fields & Submit Validation ───────────────────────────

// test.describe('Required Fields & Form Submission', () => {

//   test('should show error when required fields are empty on submit', async ({ page }) => {
//     await gotoNewBooking(page);
//     await page.getByTestId('submit-booking').click();

//     // An alert or error must appear
//     const alert = page.locator('[role="alert"]');
//     await expect(alert).toBeVisible();
//     const text = await alert.textContent();
//     expect(text.length).toBeGreaterThan(0);
//   });

//   test('should show "Missing required field: project" when project name is empty', async ({ page }) => {
//     await gotoNewBooking(page);
//     // Fill everything except project name
//     await page.getByTestId('field-cust-name').fill('Ramesh Kumar');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-prop-value').fill('5000000');
//     await page.getByTestId('field-amount').fill('50000');
//     await page.getByTestId('submit-booking').click();

//     const alert = page.locator('[role="alert"]');
//     await expect(alert).toContainText(/missing required field.*project/i);
//   });

//   test('should successfully submit a fully valid form', async ({ page }) => {
//     await gotoNewBooking(page);

//     await page.getByTestId('field-cust-name').fill('Ramesh Kumar');
//     await page.getByTestId('field-mobile').fill('9876543210');
//     await page.getByTestId('field-email').fill('ramesh@example.com');
//     await page.getByTestId('field-prop-name') // project name
//       .fill('Green Valley Phase 2')
//       .catch(() => page.locator('[placeholder="e.g. Green Valley Phase 2"]').fill('Green Valley Phase 2'));
//     await page.locator('[placeholder="e.g. B-204"]').fill('B-204');
//     await page.getByTestId('field-prop-value').fill('5000000');
//     await page.getByTestId('field-amount').fill('50000');

//     // Select payment mode
//     await page.getByTestId('field-payment-mode')
//       .selectOption('UPI')
//       .catch(() => page.locator('select').nth(1).selectOption('UPI'));

//     await page.getByTestId('submit-booking').click();

//     // Expect success — URL change, success message, or receipt page
//     await expect(page).not.toHaveURL(/new-booking/);
//   });

// });

// ─── SECTION 6: Amount in Words (auto-fill) ───────────────────────────────────

// test.describe('Amount in Words Auto-fill', () => {

//   test('should auto-fill amount in words when amount is entered', async ({ page }) => {
//     await gotoNewBooking(page);
//     const amountField   = page.getByTestId('field-amount');
//     const wordsField    = page.getByTestId('field-amount-words')
//       .or(page.locator('[placeholder="Auto-filled"]'));

//     await amountField.fill('50000');
//     await amountField.press('Tab'); // trigger blur/change event

//     const words = await wordsField.inputValue();
//     expect(words.toLowerCase()).toMatch(/fifty thousand/i);
//   });

//   test('should clear amount in words when amount is cleared', async ({ page }) => {
//     await gotoNewBooking(page);
//     const amountField = page.getByTestId('field-amount');
//     const wordsField  = page.locator('[placeholder="Auto-filled"]');

//     await amountField.fill('50000');
//     await amountField.press('Tab');
//     await amountField.fill('');
//     await amountField.press('Tab');

//     const words = await wordsField.inputValue();
//     expect(words).toBe('');
//   });

// });

                          // BUGS

//   ┌───────────────┬───────────────────┬─────────────────────────────┬────────┐
//   │     Field     │       Test        │      Actual Behaviour       │ Status │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Customer Name │ Special chars     │ Accepted — no blocking      │ BUG    │
//   │               │ (@#$%^&*())       │                             │        │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Customer Name │ Letters + spaces  │ Accepted                    │ Pass   │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Mobile Number │ Letters + !@#     │ Accepted — no blocking      │ BUG    │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Amount        │ Letters (abcXYZ)  │ Blocked by browser          │ Pass   │
//   │ received      │                   │ (spinbutton)                │        │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Area (sq.ft.) │ Letters + special │ Blocked by browser          │ Pass   │
//   │               │  chars            │ (spinbutton)                │        │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Total         │                   │                             │        │
//   │ property      │ Letters           │ Blocked, only digits kept   │ Pass   │
//   │ value         │                   │                             │        │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Email         │ Invalid format    │ Accepted without error      │ BUG    │
//   │               │ (@@bad)           │                             │        │
//   ├───────────────┼───────────────────┼─────────────────────────────┼────────┤
//   │ Submit (empty │ Click submit      │ Shows alert: "Missing       │ Pass   │
//   │  form)        │                   │ required field: project"    │        │
//   └───────────────┴───────────────────┴─────────────────────────────┴────────┘


                          // MISSING FIELDS
    // 1. Secondary Phone Number ( customer's phone number )
    // 2. Date of booking
    // 3. Authorised Signatory ( Digital signature of the Sales Executibe)

                          // EXTRA FIELDS
    // 1. Total Property value
    // 2. In payment mode - we do not require DD, Cheque