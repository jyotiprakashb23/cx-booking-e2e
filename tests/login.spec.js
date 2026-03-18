import {test, expect } from '@playwright/test'

// ─── Selectors ───────────────────────────────────────────────────────────────
const SEL = {
  email:        '#email',
  password:     '#password',
  loginBtn:     '#loginBtn',
  rememberMe:   '#rememberMe',
  togglePw:     '#togglePw',
  forgotLink:   '#forgotLink',
  googleBtn:    '#googleBtn',
  signupLink:   '#signupLink',
  alertError:   '#alertError',
  alertSuccess: '#alertSuccess',
  emailError:   '#emailError',
  passwordError:'#passwordError',
  brandName:    '.brand-name',
  pageTitle:    'h1',
  hintBox:      '.hint-box',
};

const VALID_EMAIL    = 'demo@example.com';
const VALID_PASSWORD = 'Demo@1234';

// ─── Page Object ─────────────────────────────────────────────────────────────
class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('file:///Users/jyotiprakashbehera/Downloads/login-demo.html');
  }

  async fillEmail(value) {
    await this.page.fill(SEL.email, value);
  }

  async fillPassword(value) {
    await this.page.fill(SEL.password, value);
  }

  async submit() {
    await this.page.click(SEL.loginBtn);
  }

  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Login Demo Page', () => {

  let lp;

  test.beforeEach(async ({ page }) => {
    lp = new LoginPage(page);
    await lp.goto();
  });

  // ── 1. Page Load ────────────────────────────────────────────────────────────
  test.describe('Page Load', () => {

    test('has correct page title', async ({ page }) => {
      await expect(page).toHaveTitle('Demo Login Page');
    });

    test('displays brand name "Nexus"', async ({ page }) => {
      await expect(page.locator(SEL.brandName)).toHaveText('Nexus');
    });

    test('displays heading "Welcome back"', async ({ page }) => {
      await expect(page.locator(SEL.pageTitle)).toHaveText('Welcome back');
    });

    test('shows demo credentials hint box', async ({ page }) => {
      await expect(page.locator(SEL.hintBox)).toBeVisible();
      await expect(page.locator(SEL.hintBox)).toContainText('demo@example.com');
      await expect(page.locator(SEL.hintBox)).toContainText('Demo@1234');
    });

    test('all form elements are visible', async ({ page }) => {
      await expect(page.locator(SEL.email)).toBeVisible();
      await expect(page.locator(SEL.password)).toBeVisible();
      await expect(page.locator(SEL.loginBtn)).toBeVisible();
      await expect(page.locator(SEL.rememberMe)).toBeVisible();
      await expect(page.locator(SEL.forgotLink)).toBeVisible();
      await expect(page.locator(SEL.googleBtn)).toBeVisible();
      await expect(page.locator(SEL.signupLink)).toBeVisible();
    });

    test('login button is enabled on load', async ({ page }) => {
      await expect(page.locator(SEL.loginBtn)).toBeEnabled();
    });

    test('error and success alerts are hidden on load', async ({ page }) => {
      await expect(page.locator(SEL.alertError)).toBeHidden();
      await expect(page.locator(SEL.alertSuccess)).toBeHidden();
    });

  });

  // ── 2. Form Validation ──────────────────────────────────────────────────────
  test.describe('Form Validation', () => {

    test('shows email required error on empty submit', async ({ page }) => {
      await lp.submit();
      await expect(page.locator(SEL.emailError)).toBeVisible();
      await expect(page.locator(SEL.emailError)).toContainText('Email address is required.');
    });

    test('shows password required error on empty submit', async ({ page }) => {
      await lp.submit();
      await expect(page.locator(SEL.passwordError)).toBeVisible();
      await expect(page.locator(SEL.passwordError)).toContainText('Password is required.');
    });

    test('shows invalid email format error', async ({ page }) => {
      await lp.fillEmail('notanemail');
      await lp.fillPassword('somepassword');
      await lp.submit();
      await expect(page.locator(SEL.emailError)).toBeVisible();
      await expect(page.locator(SEL.emailError)).toContainText('Please enter a valid email address.');
    });

    test('shows password too short error (< 6 chars)', async ({ page }) => {
      await lp.fillEmail(VALID_EMAIL);
      await lp.fillPassword('abc');
      await lp.submit();
      await expect(page.locator(SEL.passwordError)).toBeVisible();
      await expect(page.locator(SEL.passwordError)).toContainText('Password must be at least 6 characters.');
    });

    test('email field gets error-field class on invalid email', async ({ page }) => {
      await lp.fillEmail('bad-email');
      await lp.fillPassword(VALID_PASSWORD);
      await lp.submit();
      await expect(page.locator(SEL.email)).toHaveClass(/error-field/);
    });

    test('password field gets error-field class on short password', async ({ page }) => {
      await lp.fillEmail(VALID_EMAIL);
      await lp.fillPassword('12');
      await lp.submit();
      await expect(page.locator(SEL.password)).toHaveClass(/error-field/);
    });

    test('inline email error clears on input', async ({ page }) => {
      await lp.submit(); // trigger errors
      await expect(page.locator(SEL.emailError)).toBeVisible();
      await lp.fillEmail('a'); // start typing
      await expect(page.locator(SEL.emailError)).toBeHidden();
    });

    test('inline password error clears on input', async ({ page }) => {
      await lp.submit(); // trigger errors
      await expect(page.locator(SEL.passwordError)).toBeVisible();
      await lp.fillPassword('x'); // start typing
      await expect(page.locator(SEL.passwordError)).toBeHidden();
    });

  });

  // ── 3. Authentication ───────────────────────────────────────────────────────
  test.describe('Authentication', () => {

    test('shows success alert with valid credentials', async ({ page }) => {
      await lp.login(VALID_EMAIL, VALID_PASSWORD);
      await expect(page.locator(SEL.alertSuccess)).toBeVisible({ timeout: 5000 });
      await expect(page.locator(SEL.alertSuccess)).toContainText('Login successful');
    });

    test('shows error alert with wrong password', async ({ page }) => {
      await lp.login(VALID_EMAIL, 'wrongpassword');
      await expect(page.locator(SEL.alertError)).toBeVisible({ timeout: 5000 });
      await expect(page.locator(SEL.alertError)).toContainText('Invalid email or password');
    });

    test('shows error alert with wrong email', async ({ page }) => {
      await lp.login('wrong@example.com', VALID_PASSWORD);
      await expect(page.locator(SEL.alertError)).toBeVisible({ timeout: 5000 });
      await expect(page.locator(SEL.alertError)).toContainText('Invalid email or password');
    });

    test('shows error alert with both wrong credentials', async ({ page }) => {
      await lp.login('hacker@bad.com', 'bad123');
      await expect(page.locator(SEL.alertError)).toBeVisible({ timeout: 5000 });
    });

    test('login button is disabled while loading', async ({ page }) => {
      await lp.fillEmail(VALID_EMAIL);
      await lp.fillPassword(VALID_PASSWORD);
      // Click and immediately check disabled state (simulated ~1.4 s API delay)
      await page.click(SEL.loginBtn);
      await expect(page.locator(SEL.loginBtn)).toBeDisabled();
    });

  });

  // ── 4. Password Toggle ──────────────────────────────────────────────────────
  test.describe('Password Toggle', () => {

    test('password field type is "password" by default', async ({ page }) => {
      await expect(page.locator(SEL.password)).toHaveAttribute('type', 'password');
    });

    test('clicking toggle changes type to "text"', async ({ page }) => {
      await page.click(SEL.togglePw);
      await expect(page.locator(SEL.password)).toHaveAttribute('type', 'text');
    });

    test('clicking toggle again reverts type back to "password"', async ({ page }) => {
      await page.click(SEL.togglePw);
      await page.click(SEL.togglePw);
      await expect(page.locator(SEL.password)).toHaveAttribute('type', 'password');
    });

  });

  // ── 5. Remember Me ──────────────────────────────────────────────────────────
  test.describe('Remember Me Checkbox', () => {

    test('is unchecked by default', async ({ page }) => {
      await expect(page.locator(SEL.rememberMe)).not.toBeChecked();
    });

    test('can be checked', async ({ page }) => {
      await page.check(SEL.rememberMe);
      await expect(page.locator(SEL.rememberMe)).toBeChecked();
    });

    test('can be unchecked after checking', async ({ page }) => {
      await page.check(SEL.rememberMe);
      await page.uncheck(SEL.rememberMe);
      await expect(page.locator(SEL.rememberMe)).not.toBeChecked();
    });

  });

  // ── 6. Forgot Password ──────────────────────────────────────────────────────
  test.describe('Forgot Password Link', () => {

    test('clicking shows demo password reset message', async ({ page }) => {
      await page.click(SEL.forgotLink);
      await expect(page.locator(SEL.alertError)).toBeVisible();
      await expect(page.locator(SEL.alertError)).toContainText('Password reset link sent');
    });

    test('alert auto-hides after 3 seconds', async ({ page }) => {
      await page.click(SEL.forgotLink);
      await expect(page.locator(SEL.alertError)).toBeVisible();
      await page.waitForTimeout(3500);
      await expect(page.locator(SEL.alertError)).toBeHidden();
    });

  });

  // ── 7. Google Sign-In ───────────────────────────────────────────────────────
  test.describe('Google Sign-In Button', () => {

    test('shows "disabled in demo mode" error', async ({ page }) => {
      await page.click(SEL.googleBtn);
      await expect(page.locator(SEL.alertError)).toBeVisible();
      await expect(page.locator(SEL.alertError)).toContainText('Google sign-in is disabled in demo mode');
    });

  });

  // ── 8. Sign Up Link ─────────────────────────────────────────────────────────
  test.describe('Sign Up Link', () => {

    test('shows "Registration is disabled in demo mode" error', async ({ page }) => {
      await page.click(SEL.signupLink);
      await expect(page.locator(SEL.alertError)).toBeVisible();
      await expect(page.locator(SEL.alertError)).toContainText('Registration is disabled in demo mode');
    });

  });

  // ── 9. Accessibility & UI ───────────────────────────────────────────────────
  test.describe('Accessibility & UI', () => {

    test('email input has correct autocomplete attribute', async ({ page }) => {
      await expect(page.locator(SEL.email)).toHaveAttribute('autocomplete', 'email');
    });

    test('password input has correct autocomplete attribute', async ({ page }) => {
      await expect(page.locator(SEL.password)).toHaveAttribute('autocomplete', 'current-password');
    });

    test('toggle password button has aria-label', async ({ page }) => {
      await expect(page.locator(SEL.togglePw)).toHaveAttribute('aria-label', 'Toggle password visibility');
    });

    test('email placeholder text is correct', async ({ page }) => {
      await expect(page.locator(SEL.email)).toHaveAttribute('placeholder', 'you@example.com');
    });

    test('password placeholder text is correct', async ({ page }) => {
      await expect(page.locator(SEL.password)).toHaveAttribute('placeholder', '••••••••');
    });

    test('login button text is "Sign In"', async ({ page }) => {
      await expect(page.locator('#btnText')).toHaveText('Sign In');
    });

  });

});