// =============================================================================
// AVIHS Builders – Sales Portal
// New Booking Form – Playwright Test Suite
// URL: https://avihs-portal.itadmin-b27.workers.dev
// Tested by: Jyotiprakash Behera | Date: 2026-03-16
// =============================================================================

const { test, expect } = require('@playwright/test');

const BASE_URL   = 'https://avihs-portal.itadmin-b27.workers.dev';
const LOGIN_URL  = `${BASE_URL}/login`;
const BOOKING_URL = `${BASE_URL}/dashboard/new-booking`;

const CREDENTIALS = {
  email:    'jyotiprakash.behera@avihs.ai',
  password: 'LightOfJyoti67!',
};

// ---------------------------------------------------------------------------
// Helper: log in and land on the dashboard
// ---------------------------------------------------------------------------
async function login(page) {
  await page.goto(LOGIN_URL);
  await page.getByTestId('login-email').fill(CREDENTIALS.email);
  await page.getByTestId('login-password').fill(CREDENTIALS.password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

// ---------------------------------------------------------------------------
// Helper: fill the complete valid booking form
// ---------------------------------------------------------------------------
async function fillValidForm(page, overrides = {}) {
  const data = {
    custName:    'Rahul Sharma',
    mobile:      '9876543210',
    email:       'rahul.sharma@example.com',
    address:     'Bhubaneswar, Odisha',
    project:     'Green Valley Phase 2',
    plot:        'B-204',
    area:        '1200',
    propValue:   '2500000',
    towards:     'Booking Amount',
    amount:      '50000',
    payMode:     'UPI',
    txnNo:       'UPI123456789',
    bankName:    'HDFC Bank',
    ...overrides,
  };

  await page.getByTestId('field-cust-name').fill(data.custName);
  await page.getByTestId('field-mobile').fill(data.mobile);
  if (data.email)   await page.getByTestId('field-email').fill(data.email);
  if (data.address) await page.getByTestId('field-address').fill(data.address);
  await page.getByTestId('field-project').fill(data.project);
  await page.getByTestId('field-plot').fill(data.plot);
  if (data.area)    await page.getByTestId('field-area').fill(data.area);
  await page.getByTestId('field-prop-value').fill(data.propValue);
  await page.getByTestId('field-towards-select').selectOption(data.towards);
  await page.getByTestId('field-amount').fill(data.amount);
  await page.getByTestId('field-pay-mode').selectOption(data.payMode);
  if (data.txnNo)   await page.getByTestId('field-txn-no').fill(data.txnNo);
  if (data.bankName) await page.getByTestId('field-bank').fill(data.bankName);

  return data;
}

// ===========================================================================
// SUITE 1 – Authentication
// ===========================================================================
test.describe('Authentication', () => {

  test('TC-AUTH-01: Login page loads and shows correct elements', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await expect(page.getByRole('heading', { name: 'AVIHS Builders' })).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue as guest →' })).toBeVisible();
  });

  test('TC-AUTH-02: Valid credentials redirect to dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.getByText('Jyotiprakash Behera')).toBeVisible();
  });

  test('TC-AUTH-03: Dashboard tabs are visible after login', async ({ page }) => {
    await login(page);
    await expect(page.getByTestId('tab-dashboard')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'My Bookings' })).toBeVisible();
    await expect(page.getByTestId('tab-new-booking')).toBeVisible();
  });

});

// ===========================================================================
// SUITE 2 – New Booking Form – UI / Navigation
// ===========================================================================
test.describe('New Booking – Form UI', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByTestId('tab-new-booking').click();
    await page.waitForURL(BOOKING_URL);
  });

  test('TC-UI-01: Form contains all three sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Customer details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Property details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment details' })).toBeVisible();
  });

  test('TC-UI-02: Customer Details – all fields present', async ({ page }) => {
    await expect(page.getByTestId('field-cust-name')).toBeVisible();
    await expect(page.getByTestId('field-mobile')).toBeVisible();
    await expect(page.getByTestId('field-email')).toBeVisible();
    await expect(page.getByTestId('field-address')).toBeVisible();
  });

  test('TC-UI-03: Property Details – all fields present', async ({ page }) => {
    await expect(page.getByTestId('field-project')).toBeVisible();
    await expect(page.getByTestId('field-plot')).toBeVisible();
    await expect(page.getByTestId('field-area')).toBeVisible();
    await expect(page.getByTestId('field-prop-value')).toBeVisible();
    await expect(page.getByTestId('field-towards-select')).toBeVisible();
  });

  test('TC-UI-04: Payment Details – all fields present', async ({ page }) => {
    await expect(page.getByTestId('field-amount')).toBeVisible();
    await expect(page.getByTestId('field-pay-mode')).toBeVisible();
    await expect(page.getByTestId('field-txn-no')).toBeVisible();
    await expect(page.getByTestId('field-bank')).toBeVisible();
    await expect(page.getByTestId('submit-booking')).toBeVisible();
    await expect(page.getByTestId('clear-form')).toBeVisible();
  });

  test('TC-UI-05: Towards dropdown contains all expected options', async ({ page }) => {
    const select = page.getByTestId('field-towards-select');
    await expect(select.locator('option', { hasText: 'Booking Amount' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Token Amount' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Part Payment' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Full Payment' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Custom…' })).toBeAttached();
  });

  test('TC-UI-06: Payment mode dropdown contains all expected options', async ({ page }) => {
    const select = page.getByTestId('field-pay-mode');
    for (const mode of ['Cash', 'Cheque', 'DD', 'NEFT', 'RTGS', 'UPI']) {
      await expect(select.locator(`option:text("${mode}")`)).toBeAttached();
    }
  });

  test('TC-UI-07: Amount in words field is read-only / auto-filled placeholder', async ({ page }) => {
    const amountInWords = page.getByTestId
      ? page.locator('[placeholder="Auto-filled"]')
      : page.getByPlaceholder('Auto-filled');
    await expect(amountInWords).toBeVisible();
    // Confirm it is read-only (user cannot type into it directly)
    const isReadonly = await amountInWords.getAttribute('readonly');
    const isDisabled = await amountInWords.getAttribute('disabled');
    expect(isReadonly !== null || isDisabled !== null).toBeTruthy();
  });

});

// ===========================================================================
// SUITE 3 – Form Validation
// ===========================================================================
test.describe('New Booking – Validation', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(BOOKING_URL);
  });

  // ── Required-field chain ────────────────────────────────────────────────

  test('TC-VAL-01: Empty form submission shows "Missing required field: cust_name"', async ({ page }) => {
    await page.getByTestId('submit-booking').click();
    await expect(page.getByRole('alert')).toContainText('Missing required field: cust_name');
    // Still on same page
    await expect(page).toHaveURL(BOOKING_URL);
  });

  test('TC-VAL-02: Only customer name filled shows "Missing required field: mobile"', async ({ page }) => {
    await page.getByTestId('field-cust-name').fill('Rahul Sharma');
    await page.getByTestId('submit-booking').click();
    await expect(page.getByRole('alert')).toContainText('Missing required field: mobile');
    await expect(page).toHaveURL(BOOKING_URL);
  });

  test('TC-VAL-03: Name + mobile filled shows "Missing required field: project"', async ({ page }) => {
    await page.getByTestId('field-cust-name').fill('Rahul Sharma');
    await page.getByTestId('field-mobile').fill('9876543210');
    await page.getByTestId('submit-booking').click();
    await expect(page.getByRole('alert')).toContainText('Missing required field: project');
    await expect(page).toHaveURL(BOOKING_URL);
  });

  // ── [BUG] Mobile format not validated ───────────────────────────────────

  test('TC-VAL-04: [BUG] Short mobile number (5 digits) passes without format validation', async ({ page }) => {
    /*
     * EXPECTED: Form should reject "12345" as an invalid Indian mobile number.
     * ACTUAL:   Form accepts it and advances to the next required-field check.
     * SEVERITY: Medium – incorrect data saved in bookings.
     */
    await page.getByTestId('field-cust-name').fill('Rahul Sharma');
    await page.getByTestId('field-mobile').fill('12345');   // Only 5 digits
    await page.getByTestId('submit-booking').click();

    const alertText = await page.getByRole('alert').textContent();
    // Bug: error is about the *next* field, NOT about mobile format
    expect(alertText).not.toContain('mobile');
    expect(alertText).toContain('project');   // Validation moved past mobile
  });

  // ── [BUG] Email format not validated ────────────────────────────────────

  test('TC-VAL-05: [BUG] Invalid email format accepted and receipt generated', async ({ page }) => {
    /*
     * EXPECTED: Form should reject "not-an-email" as an invalid e-mail address.
     * ACTUAL:   Form submits successfully and a receipt is created.
     * SEVERITY: Low–Medium – invalid contact data persisted.
     */
    await fillValidForm(page, { email: 'not-an-email' });
    await page.getByTestId('submit-booking').click();

    // Bug: lands on receipt page instead of showing email validation error
    await expect(page).not.toHaveURL(BOOKING_URL);
    await expect(page.getByRole('heading', { name: /Receipt preview/i })).toBeVisible();
  });

  // ── [BUG] Custom "Towards" – empty description accepted ─────────────────

  test('TC-VAL-06: [BUG] Custom Towards with empty description submits without error', async ({ page }) => {
    /*
     * EXPECTED: Selecting "Custom…" and leaving "Describe purpose" blank
     *           should prevent form submission.
     * ACTUAL:   Form submits; the saved "Towards" falls back to "Booking Amount".
     * SEVERITY: Medium – intent of payment is lost/misrecorded.
     */
    await fillValidForm(page);
    await page.getByTestId('field-towards-select').selectOption('Custom…');
    // Do NOT fill the "Describe purpose" field
    await page.getByTestId('submit-booking').click();

    // Bug: receipt is generated instead of a validation error
    await expect(page).not.toHaveURL(BOOKING_URL);
    const receipt = page.locator('text=Booking confirmed');
    await expect(receipt).toBeVisible();
  });

});

// ===========================================================================
// SUITE 4 – Form Behaviour / Dynamic Fields
// ===========================================================================
test.describe('New Booking – Dynamic Behaviour', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(BOOKING_URL);
  });

  test('TC-DYN-01: Selecting "Custom…" reveals "Describe purpose" text field', async ({ page }) => {
    const select = page.getByTestId('field-towards-select');
    // Before selecting Custom – the extra field should not be visible
    await expect(page.getByPlaceholder('Describe purpose')).not.toBeVisible();

    await select.selectOption('Custom…');

    // After selecting Custom – the extra field should appear
    await expect(page.getByPlaceholder('Describe purpose')).toBeVisible();
  });

  test('TC-DYN-02: Switching away from "Custom…" hides "Describe purpose" field', async ({ page }) => {
    await page.getByTestId('field-towards-select').selectOption('Custom…');
    await expect(page.getByPlaceholder('Describe purpose')).toBeVisible();

    await page.getByTestId('field-towards-select').selectOption('Token Amount');
    await expect(page.getByPlaceholder('Describe purpose')).not.toBeVisible();
  });

  test('TC-DYN-03: Amount in words auto-fills when amount is entered', async ({ page }) => {
    await page.getByTestId('field-amount').fill('50000');
    // Trigger change event
    await page.getByTestId('field-amount').press('Tab');

    const amountInWords = page.getByPlaceholder('Auto-filled');
    await expect(amountInWords).toHaveValue('Fifty Thousand Rupees Only');
  });

  test('TC-DYN-04: Amount in words updates on amount change', async ({ page }) => {
    await page.getByTestId('field-amount').fill('100000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('One Lakh Rupees Only');

    await page.getByTestId('field-amount').fill('25000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('Twenty Five Thousand Rupees Only');
  });

  test('TC-DYN-05: Clear button resets all form fields', async ({ page }) => {
    await fillValidForm(page);

    await page.getByTestId('clear-form').click();

    // All required text fields should be empty
    await expect(page.getByTestId('field-cust-name')).toHaveValue('');
    await expect(page.getByTestId('field-mobile')).toHaveValue('');
    await expect(page.getByTestId('field-project')).toHaveValue('');
    await expect(page.getByTestId('field-plot')).toHaveValue('');
    await expect(page.getByTestId('field-email')).toHaveValue('');
    await expect(page.getByTestId('field-address')).toHaveValue('');

    // Dropdowns reset to defaults
    await expect(page.getByTestId('field-towards-select')).toHaveValue('Booking Amount');
    await expect(page.getByTestId('field-pay-mode')).toHaveValue('Select mode');
  });

  test('TC-DYN-06: Amount in words is cleared when amount field is cleared', async ({ page }) => {
    await page.getByTestId('field-amount').fill('75000');
    await page.getByTestId('field-amount').press('Tab');
    await expect(page.getByPlaceholder('Auto-filled')).not.toHaveValue('');

    // Now clear via the Clear button
    await page.getByTestId('clear-form').click();
    await expect(page.getByPlaceholder('Auto-filled')).toHaveValue('');
  });

});

// ===========================================================================
// SUITE 5 – Successful Booking Submission & Receipt
// ===========================================================================
test.describe('New Booking – Successful Submission', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(BOOKING_URL);
  });

  test('TC-SUB-01: Valid form submission redirects to receipt page', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page).toHaveURL(/\/dashboard\/receipt\//);
  });

  test('TC-SUB-02: Receipt page shows "Booking confirmed" success banner', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.locator('text=Booking confirmed')).toBeVisible();
    await expect(page.locator('text=Transaction recorded successfully')).toBeVisible();
  });

  test('TC-SUB-03: Receipt has a sequential booking number (AV-YYYY-NNN)', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    const bookingText = await page.locator('text=/AV-\\d{4}-\\d+/').first().textContent();
    expect(bookingText).toMatch(/AV-\d{4}-\d+/);
  });

  test('TC-SUB-04: Transaction ID is displayed and Copy button is present', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    // Transaction ID starts with "APT"
    await expect(page.locator('text=/^APT[A-F0-9]+$/i').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });

  test('TC-SUB-05: Receipt preview shows correct customer details', async ({ page }) => {
    const data = await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.locator(`text=${data.custName}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.mobile}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.email}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.address}`).first()).toBeVisible();
  });

  test('TC-SUB-06: Receipt preview shows correct property details', async ({ page }) => {
    const data = await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.locator(`text=${data.project}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.plot}`).first()).toBeVisible();
    await expect(page.locator('text=₹25,00,000').first()).toBeVisible();
  });

  test('TC-SUB-07: Receipt preview shows correct payment details', async ({ page }) => {
    const data = await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.locator('text=₹50,000').first()).toBeVisible();
    await expect(page.locator('text=Fifty Thousand Rupees Only').first()).toBeVisible();
    await expect(page.locator(`text=${data.payMode}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.txnNo}`).first()).toBeVisible();
    await expect(page.locator(`text=${data.bankName}`).first()).toBeVisible();
  });

  test('TC-SUB-08: Receipt page has Back to dashboard, Edit, Email and Print buttons', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.getByRole('link', { name: 'Back to dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email to customer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print / Save PDF' })).toBeVisible();
  });

  test('TC-SUB-09: Receipt shows "Booked by" the logged-in user', async ({ page }) => {
    await fillValidForm(page);
    await page.getByTestId('submit-booking').click();

    await expect(page.locator('text=Booked by: Jyotiprakash Behera')).toBeVisible();
  });

  test('TC-SUB-10: Submitting with all payment modes creates a receipt', async ({ page }) => {
    const payModes = ['Cash', 'Cheque', 'DD', 'NEFT', 'RTGS', 'UPI'];
    for (const mode of payModes) {
      await page.goto(BOOKING_URL);
      await fillValidForm(page, { payMode: mode, txnNo: '', bankName: '' });
      await page.getByTestId('submit-booking').click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
      await expect(page.locator('text=Booking confirmed')).toBeVisible();
    }
  });

});

// ===========================================================================
// SUITE 6 – Dashboard Stats Update After Booking
// ===========================================================================
test.describe('Dashboard – Stats After Booking', () => {

  test('TC-DASH-01: Dashboard reflects new booking in "Recent bookings" list', async ({ page }) => {
    await login(page);
    await page.goto(BOOKING_URL);

    await fillValidForm(page, {
      custName: 'Priya Patel',
      mobile:   '8887776665',
      project:  'Sunrise Heights',
      plot:     'C-101',
      amount:   '30000',
      payMode:  'NEFT',
    });
    await page.getByTestId('submit-booking').click();
    await expect(page.locator('text=Booking confirmed')).toBeVisible();

    // Navigate to Dashboard
    await page.getByTestId('tab-dashboard').click();
    await expect(page.locator('text=Priya Patel')).toBeVisible();
    await expect(page.locator('text=Sunrise Heights')).toBeVisible();
  });

  test('TC-DASH-02: Dashboard shows correct "Bookings this month" count', async ({ page }) => {
    await login(page);
    await page.getByTestId('tab-dashboard').click();

    const countEl = page.locator('text=Bookings this month').locator('..').locator('text=/^\\d+$/');
    const countBefore = parseInt(await countEl.textContent(), 10);

    // Create one new booking
    await page.goto(BOOKING_URL);
    await fillValidForm(page, { custName: 'Count Test User', mobile: '7001234560' });
    await page.getByTestId('submit-booking').click();
    await expect(page.locator('text=Booking confirmed')).toBeVisible();

    // Re-check count
    await page.getByTestId('tab-dashboard').click();
    const countAfter = parseInt(await countEl.textContent(), 10);
    expect(countAfter).toBe(countBefore + 1);
  });

});
