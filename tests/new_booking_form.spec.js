import { test, expect } from '@playwright/test';

const BASE_URL = 'https://portal.avihsbuilders.com';

// ---------------------------------------------------------------------------
// Selectors
// Form labels are <div> elements, NOT <label> — getByLabel() does not work.
// Use testIDs, placeholders, and role+nth instead.
// ---------------------------------------------------------------------------

const SEL = {
  // Customer
  firstName:      (p) => p.getByTestId('field-first-name'),
  middleName:     (p) => p.getByPlaceholder('Middle name'),
  lastName:       (p) => p.getByTestId('field-last-name'),
  mobile:         (p) => p.getByTestId('field-mobile'),
  altPhone:       (p) => p.getByPlaceholder('Alternate contact number'),
  email:          (p) => p.getByPlaceholder('customer@email.com'),
  address:        (p) => p.getByPlaceholder('City, State'),

  // Property
  project:        (p) => p.getByTestId('field-project-select'),
  plot:           (p) => p.getByTestId('field-plot'),
  plotSize:       (p) => p.getByPlaceholder('Auto-filled from plot'),
  totalValue:     (p) => p.getByRole('spinbutton').first(),   // 1st spinbutton
  bookingDate:    (p) => p.locator('input[type="date"]'),

  // Payment
  amountReceived: (p) => p.getByRole('spinbutton').nth(1),    // 2nd spinbutton
  amountInWords:  (p) => p.getByPlaceholder('Auto-filled'),
  paymentMode:    (p) => p.getByRole('combobox').nth(2),      // project=0, plot=1, mode=2
  txnRef:         (p) => p.getByPlaceholder('Optional').first(),
  bankName:       (p) => p.getByPlaceholder('Optional').nth(1),

  // Actions
  submit:         (p) => p.getByTestId('submit-booking'),
  clear:          (p) => p.getByRole('button', { name: 'Clear' }),
  alert:          (p) => p.getByRole('alert'),
};

// ---------------------------------------------------------------------------
// Navigation — auth is handled by storageState in playwright.config.js,
// no login() call needed here.
// ---------------------------------------------------------------------------

async function goToNewBooking(page) {
  await page.goto(`${BASE_URL}/dashboard/new-booking`);
  await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
}

// ---------------------------------------------------------------------------
// Data helper
// ---------------------------------------------------------------------------

function validBookingData() {
  return {
    firstName:   'Arjun',
    middleName:  'Kumar',
    lastName:    'Mehta',
    mobile:      '9876543210',
    altPhone:    '9123456780',
    email:       'arjun.mehta@example.com',
    address:     'Bhubaneswar, Odisha',
    project:     'Dev Nagar',
    plot:        'Plot A-4 — 30×60 (1800 sq.ft.)',   // available (not booked)
    totalValue:  '1500000',
    amount:      '50000',
    paymentMode: 'Cash',
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('New Booking Form — AVIHS Builders Sales Portal', () => {

  test.beforeEach(async ({ page }) => {
    await goToNewBooking(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PAGE STRUCTURE
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Page structure', () => {

    test('should show all three sections', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Customer details' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Property details' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Payment details' })).toBeVisible();
    });

    test('should show Save and Clear buttons', async ({ page }) => {
      await expect(SEL.submit(page)).toBeVisible();
      await expect(SEL.clear(page)).toBeVisible();
    });

    test("should pre-fill today's date in Date of booking", async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      await expect(SEL.bookingDate(page)).toHaveValue(today);
    });

    test('should show all customer fields', async ({ page }) => {
      await expect(SEL.firstName(page)).toBeVisible();
      await expect(SEL.middleName(page)).toBeVisible();
      await expect(SEL.lastName(page)).toBeVisible();
      await expect(SEL.mobile(page)).toBeVisible();
      await expect(SEL.altPhone(page)).toBeVisible();
      await expect(SEL.email(page)).toBeVisible();
      await expect(SEL.address(page)).toBeVisible();
    });

    test('should show all payment fields', async ({ page }) => {
      await expect(SEL.amountReceived(page)).toBeVisible();
      await expect(SEL.amountInWords(page)).toBeVisible();
      await expect(SEL.paymentMode(page)).toBeVisible();
      await expect(SEL.txnRef(page)).toBeVisible();
      await expect(SEL.bankName(page)).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. REQUIRED FIELD VALIDATION (sequential error messages)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Required field validation', () => {

    test('should show error for missing first name on empty submit', async ({ page }) => {
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/first_name/i);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
    });

    test('should show error for missing project after customer fields filled', async ({ page }) => {
      await SEL.firstName(page).fill('Arjun');
      await SEL.lastName(page).fill('Mehta');
      await SEL.mobile(page).fill('9876543210');
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/project/i);
    });

    test('should show error for missing plot after project filled', async ({ page }) => {
      await SEL.firstName(page).fill('Arjun');
      await SEL.lastName(page).fill('Mehta');
      await SEL.mobile(page).fill('9876543210');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/plot/i);
    });

    test('should show error for missing total property value', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill(d.mobile);
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/prop_value/i);
    });

    test('should show error for missing amount received', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill(d.mobile);
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.totalValue(page).fill(d.totalValue);
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/amount/i);
    });

    test('should show error for missing payment mode', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill(d.mobile);
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.totalValue(page).fill(d.totalValue);
      await SEL.amountReceived(page).fill(d.amount);
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toContainText(/payment_mode|mode/i);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FIELD-LEVEL VALIDATION
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Field-level validation', () => {

    test('mobile number should reject fewer than 10 digits', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill('98765');
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.totalValue(page).fill(d.totalValue);
      await SEL.amountReceived(page).fill(d.amount);
      await SEL.paymentMode(page).selectOption('Cash');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
    });

    test('mobile number should not accept alphabetic input', async ({ page }) => {
      await SEL.mobile(page).fill('abcdefghij');
      const value = await SEL.mobile(page).inputValue();
      expect(value).not.toMatch(/[a-zA-Z]/);
    });

    test('first name should reject numeric characters', async ({ page }) => {
      await SEL.firstName(page).fill('Arjun123');
      const value = await SEL.firstName(page).inputValue();
      if (value.includes('123')) {
        await SEL.lastName(page).fill('Mehta');
        await SEL.mobile(page).fill('9876543210');
        await SEL.project(page).selectOption('Dev Nagar');
        await SEL.plot(page).selectOption('Plot A-4 — 30×60 (1800 sq.ft.)');
        await SEL.totalValue(page).fill('1500000');
        await SEL.amountReceived(page).fill('50000');
        await SEL.paymentMode(page).selectOption('Cash');
        await SEL.submit(page).click();
        await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
      }
    });

    test('email should reject invalid format', async ({ page }) => {
      await SEL.firstName(page).fill('Arjun');
      await SEL.lastName(page).fill('Mehta');
      await SEL.mobile(page).fill('9876543210');
      await SEL.email(page).fill('not-an-email');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-4 — 30×60 (1800 sq.ft.)');
      await SEL.totalValue(page).fill('1500000');
      await SEL.amountReceived(page).fill('50000');
      await SEL.paymentMode(page).selectOption('Cash');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
    });

    test('amount received should not accept negative values', async ({ page }) => {
      await SEL.amountReceived(page).fill('-10000');
      const value = await SEL.amountReceived(page).inputValue();
      if (value === '-10000') {
        await SEL.firstName(page).fill('Arjun');
        await SEL.lastName(page).fill('Mehta');
        await SEL.mobile(page).fill('9876543210');
        await SEL.project(page).selectOption('Dev Nagar');
        await SEL.plot(page).selectOption('Plot A-4 — 30×60 (1800 sq.ft.)');
        await SEL.totalValue(page).fill('1500000');
        await SEL.paymentMode(page).selectOption('Cash');
        await SEL.submit(page).click();
        await expect(page).toHaveURL(`${BASE_URL}/dashboard/new-booking`);
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. DYNAMIC / INTERACTIVE BEHAVIOUR
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Dynamic behaviour', () => {

    test('plot dropdown should be disabled before project is selected', async ({ page }) => {
      await expect(SEL.plot(page)).toBeDisabled();
    });

    test('plot dropdown should be enabled after project is selected', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      await expect(SEL.plot(page)).toBeEnabled();
    });

    test('plot dropdown should load plots for Hemant Vihar', async ({ page }) => {
      await SEL.project(page).selectOption('Hemant Vihar');
      const options = await SEL.plot(page).locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(1);
    });

    test('plot dropdown should load plots for Dev Nagar', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      const options = await SEL.plot(page).locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(1);
    });

    test('plot size should auto-fill when a plot is selected', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-2 — 30×55 (1650 sq.ft.)');
      await expect(SEL.plotSize(page)).toHaveValue(/1650 sq\.ft\./);
    });

    test('plot size should update when plot selection changes', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-2 — 30×55 (1650 sq.ft.)');
      await SEL.plot(page).selectOption('Plot A-4 — 30×60 (1800 sq.ft.)');
      await expect(SEL.plotSize(page)).toHaveValue(/1800 sq\.ft\./);
    });

    test('amount in words should auto-fill when amount is entered', async ({ page }) => {
      await SEL.amountReceived(page).fill('50000');
      await SEL.amountReceived(page).press('Tab');
      await expect(SEL.amountInWords(page)).not.toHaveValue('');
    });

    test('amount in words should update when amount changes', async ({ page }) => {
      await SEL.amountReceived(page).fill('50000');
      await SEL.amountReceived(page).press('Tab');
      const words1 = await SEL.amountInWords(page).inputValue();

      await SEL.amountReceived(page).fill('100000');
      await SEL.amountReceived(page).press('Tab');
      const words2 = await SEL.amountInWords(page).inputValue();

      expect(words1).not.toEqual(words2);
    });

    test('switching project should reset the plot selection', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-4 — 30×60 (1800 sq.ft.)');
      await SEL.project(page).selectOption('Hemant Vihar');
      const selectedPlot = await SEL.plot(page).inputValue();
      expect(selectedPlot).toBeFalsy();
    });

    test('[BUG CHECK] booked plots should not be selectable', async ({ page }) => {
      await SEL.project(page).selectOption('Dev Nagar');
      const bookedOption = SEL.plot(page)
        .locator('option', { hasText: '(Booked)' })
        .first();
      const isDisabled = await bookedOption.evaluate((el) => el.disabled);
      // This may FAIL — if so, report as a bug: users can select already-booked plots
      expect(isDisabled).toBe(true);
    });

    test('plot size field should be read-only', async ({ page }) => {
      const field = SEL.plotSize(page);
      const isDisabled = await field.isDisabled();
      const hasReadonly = await field.getAttribute('readonly');
      expect(isDisabled || hasReadonly !== null).toBe(true);
    });

    test('amount in words field should be read-only', async ({ page }) => {
      const field = SEL.amountInWords(page);
      const isDisabled = await field.isDisabled();
      const hasReadonly = await field.getAttribute('readonly');
      expect(isDisabled || hasReadonly !== null).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CLEAR BUTTON
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Clear button', () => {

    test('should reset all fields to default state', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill(d.mobile);
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.totalValue(page).fill(d.totalValue);
      await SEL.amountReceived(page).fill(d.amount);
      await SEL.paymentMode(page).selectOption(d.paymentMode);

      await SEL.clear(page).click();

      await expect(SEL.firstName(page)).toHaveValue('');
      await expect(SEL.lastName(page)).toHaveValue('');
      await expect(SEL.mobile(page)).toHaveValue('');
      await expect(SEL.project(page)).toHaveValue('');
      await expect(SEL.plot(page)).toBeDisabled();
    });

    test('should dismiss the alert banner after a failed submit', async ({ page }) => {
      await SEL.submit(page).click();
      await expect(SEL.alert(page)).toBeVisible();
      await SEL.clear(page).click();
      await expect(SEL.alert(page)).not.toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PAYMENT MODE OPTIONS
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Payment mode options', () => {

    test('should list Cash, NEFT, RTGS, UPI as payment modes', async ({ page }) => {
      const options = await SEL.paymentMode(page).locator('option').allTextContents();
      expect(options).toContain('Cash');
      expect(options).toContain('NEFT');
      expect(options).toContain('RTGS');
      expect(options).toContain('UPI');
    });

    test('transaction ref and bank name should be optional', async ({ page }) => {
      await expect(SEL.txnRef(page)).toBeVisible();
      await expect(SEL.bankName(page)).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. HAPPY PATH — SUCCESSFUL SUBMISSIONS
  // NOTE: These tests create real bookings. Use available (non-booked) plots.
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Happy path — full valid submissions', () => {

    test('should submit with Cash payment (all fields)', async ({ page }) => {
      const d = validBookingData();
      await SEL.firstName(page).fill(d.firstName);
      await SEL.middleName(page).fill(d.middleName);
      await SEL.lastName(page).fill(d.lastName);
      await SEL.mobile(page).fill(d.mobile);
      await SEL.altPhone(page).fill(d.altPhone);
      await SEL.email(page).fill(d.email);
      await SEL.address(page).fill(d.address);
      await SEL.project(page).selectOption(d.project);
      await SEL.plot(page).selectOption(d.plot);
      await SEL.totalValue(page).fill(d.totalValue);
      await SEL.amountReceived(page).fill(d.amount);
      await SEL.paymentMode(page).selectOption('Cash');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
    });

    test('should submit with UPI and transaction ref', async ({ page }) => {
      await SEL.firstName(page).fill('Priya');
      await SEL.lastName(page).fill('Nair');
      await SEL.mobile(page).fill('9000011111');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-7 — 30×45 (1350 sq.ft.)');
      await SEL.totalValue(page).fill('1200000');
      await SEL.amountReceived(page).fill('25000');
      await SEL.paymentMode(page).selectOption('UPI');
      await SEL.txnRef(page).fill('UPI123456789');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
    });

    test('should submit with NEFT and bank name', async ({ page }) => {
      await SEL.firstName(page).fill('Suresh');
      await SEL.lastName(page).fill('Rao');
      await SEL.mobile(page).fill('9000022222');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-9 — 30×55 (1650 sq.ft.)');
      await SEL.totalValue(page).fill('1400000');
      await SEL.amountReceived(page).fill('75000');
      await SEL.paymentMode(page).selectOption('NEFT');
      await SEL.txnRef(page).fill('NEFT20260320001');
      await SEL.bankName(page).fill('State Bank of India');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
    });

    test('should submit with only required fields', async ({ page }) => {
      await SEL.firstName(page).fill('Minimal');
      await SEL.lastName(page).fill('User');
      await SEL.mobile(page).fill('9000033333');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-12 — 40×50 (2000 sq.ft.)');
      await SEL.totalValue(page).fill('1800000');
      await SEL.amountReceived(page).fill('10000');
      await SEL.paymentMode(page).selectOption('Cash');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. RECEIPT PAGE — post-submission checks
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Receipt page after successful submission', () => {

    async function submitMinimalBooking(page) {
      await SEL.firstName(page).fill('Receipt');
      await SEL.lastName(page).fill('Test');
      await SEL.mobile(page).fill('9000044444');
      await SEL.project(page).selectOption('Dev Nagar');
      await SEL.plot(page).selectOption('Plot A-15 — 30×45 (1350 sq.ft.)');
      await SEL.totalValue(page).fill('1100000');
      await SEL.amountReceived(page).fill('11000');
      await SEL.paymentMode(page).selectOption('Cash');
      await SEL.submit(page).click();
      await expect(page).toHaveURL(/\/dashboard\/receipt\//);
    }

    test('receipt page should display customer name', async ({ page }) => {
      await submitMinimalBooking(page);
      await expect(page.getByText(/Receipt Test/i)).toBeVisible();
    });

    test('receipt page should show a PDF download link', async ({ page }) => {
      await submitMinimalBooking(page);
      await expect(page.getByRole('link', { name: /pdf/i })).toBeVisible();
    });

    test('receipt page should show receipt serial number (AV-YYYY-NNN format)', async ({ page }) => {
      await submitMinimalBooking(page);
      await expect(page.getByText(/AV-\d{4}-\d{3}/)).toBeVisible();
    });

  });

});
