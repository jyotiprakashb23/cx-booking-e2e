# cx-booking-e2e
# Testing Process Document

**Author:** Jyotiprakash Behera
**Date:** March 2026
**Last Updated:** 2026-03-17

---

## 1. Overview

This document describes the testing process, tools, methodologies, and practices currently in use across projects. The primary testing focus is **End-to-End (E2E) browser automation** using Playwright, targeting the AVIHS Builders Sales Portal. Testing also covers UI validation, form behaviour, dynamic interactions, and regression tracking for known bugs.

---

## 2. Tools & Frameworks

| Tool / Framework | Version | Purpose |
|---|---|---|
| **Playwright** | `^1.58.2` | E2E browser automation (primary tool) |
| **Jest** | (via CRA) | Unit/component testing for React |
| **React Testing Library** | CRA default | Component rendering tests |
| **Django Test Framework** | Built-in | Backend unit testing (scaffolded, not yet implemented) |
| **Node.js** | LTS | Runtime for Playwright test runner |

---

## 3. Projects Under Test

### 3.1 AVIHS Builders Sales Portal (Primary)
- **URL:** `https://avihs-portal.itadmin-b27.workers.dev`
- **Type:** Web application — bookings, customer management, receipts
- **Test files:**
  - `newBookingTests.js` — full production-quality suite (6 suites, 27+ test cases)
  - `tests/newBookingForm.spec.js` — field visibility tests, active; validation tests commented out
  - `tests/avihsBookingForm.spec.js` — exploratory file, bug regression tests, mostly commented

### 3.2 Login Demo Page
- **URL:** `file:///Users/.../login-demo.html` (local HTML file)
- **Type:** Login form with validation, password toggle, remember-me
- **Test file:** `tests/login.spec.js` — 9 test groups, ~30 tests

### 3.3 Customer Information Form
- **URL:** `https://luminous-rabanadas-5d4b5d.netlify.app/`
- **Type:** Customer data entry form deployed on Netlify
- **Test file:** `customer_form.spec.ts` (TypeScript) — 12 tests covering all 10 form fields

### 3.4 Docker React App
- **Location:** `Documents/Project Folders/Backend/docker-demo/docker-app/`
- **Type:** React (Create React App)
- **Test file:** `src/App.test.js` — single component render test (Jest + RTL)

### 3.5 AVIHS CRM (Django Backend)
- **Location:** `Documents/Project Folders/avihs-builders-crm/`
- **Status:** Test scaffold exists (`tests.py`), no tests written yet

---

## 4. Test Types

### 4.1 End-to-End (E2E) Tests
Full browser flows are automated: navigating to the application, logging in, filling forms, submitting, and verifying results (e.g., receipt content, booking number format, dashboard counters).

**Example:** After submitting a valid booking form, the test asserts:
- Redirect to receipt page
- Booking number matches format `AV-YYYY-NNN`
- Transaction ID is copyable
- All 6 payment modes work correctly

### 4.2 UI / Page Load Tests
Verify that critical UI elements are present and visible on page load — headings, form sections, buttons, input fields, dropdowns.

### 4.3 Form Validation Tests
Test both valid and invalid inputs:
- Required fields trigger appropriate error messages
- Format rules enforced (email, phone, Aadhaar 12-digit, PAN, pincode 6-digit)
- Invalid inputs are rejected before submission

### 4.4 Dynamic Behaviour Tests
Verify conditional UI logic:
- Custom dropdown option reveals/hides an extra text field
- "Amount in Words" auto-fills when a numeric amount is entered
- Clear button resets all fields to empty state

### 4.5 Bug Regression Tests
Intentionally written tests that document **known bugs**. These tests are expected to fail. They serve as living bug reports within the codebase.

**Example bugs documented:**
- Mobile number field accepts only 5 digits (TC-VAL-04)
- Email field accepts clearly invalid formats (TC-VAL-05)
- "Towards: Custom" field allows blank description to submit (TC-VAL-06)

### 4.6 Unit / Component Tests
React component tests using Jest + React Testing Library — verifies components render correctly in isolation.

### 4.7 Exploratory / Interactive Tests
Manual-mode Playwright scripts (e.g., `youtube.spec.js`) use `page.pause()` to pause execution and interact manually with the browser during debugging sessions.

---

## 5. Test Organisation & Naming Conventions

### Directory Structure
```
Desktop/Playwright/
├── playwright.config.js
├── newBookingTests.js          ← Primary full suite
├── customer_form.spec.ts       ← Customer form (TypeScript)
├── tests/
│   ├── login.spec.js           ← Login page suite
│   ├── avihsBookingForm.spec.js ← Exploratory / bug regression
│   ├── newBookingForm.spec.js  ← Field visibility suite
│   ├── example.spec.js         ← Playwright starter
│   └── youtube.spec.js         ← Exploratory / manual
└── .github/
    └── workflows/
        └── playwright.yml      ← CI/CD pipeline
```

### Test Case Naming
Test cases in `newBookingTests.js` follow a structured naming convention:

| Prefix | Area |
|---|---|
| `TC-AUTH-XX` | Authentication |
| `TC-UI-XX` | UI / Page Load |
| `TC-VAL-XX` | Form Validation |
| `TC-DYN-XX` | Dynamic Behaviour |
| `TC-SUB-XX` | Form Submission |
| `TC-DASH-XX` | Dashboard Stats |

### Page Object Model (POM)
Login flows use a **Page Object Model** pattern — a `LoginPage` class encapsulates selectors and actions, making tests cleaner and easier to maintain.

A shared `fillValidForm(overrides)` helper function fills the booking form with default valid data, with optional field-level overrides per test case. This avoids repetition across the submission test suite.

---

## 6. Playwright Configuration

**File:** `playwright.config.js`

| Setting | Value |
|---|---|
| Test directory | `./tests` |
| Parallel execution | Fully parallel (`fullyParallel: true`) |
| Retries (CI) | 2 |
| Workers (CI) | 1 |
| Reporter | HTML |
| Screenshots | `on` (captured for every test) |
| Video recording | `on` (recorded for every test) |
| Trace | `on-first-retry` |

**Browsers tested:**
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

---

## 7. How to Run Tests

### Run All Playwright Tests
```bash
cd ~/Desktop/Playwright
npx playwright test
```

### Run a Specific Test File
```bash
npx playwright test tests/login.spec.js
npx playwright test newBookingTests.js
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See the Browser)
```bash
npx playwright test --headed
```

### Open the HTML Report After a Run
```bash
npx playwright show-report
```

### Run React Unit Tests (Docker App)
```bash
cd ~/Documents/Project\ Folders/Backend/docker-demo/docker-app
npm test
```

---

## 8. CI/CD Pipeline

**File:** `.github/workflows/playwright.yml`
**Platform:** GitHub Actions

| Step | Action |
|---|---|
| Trigger | Push or PR to `main` / `master` |
| Runner | `ubuntu-latest` |
| 1 | Checkout repository |
| 2 | Setup Node.js (LTS) |
| 3 | `npm ci` — install dependencies |
| 4 | `npx playwright install --with-deps` — install browsers |
| 5 | `npx playwright test` — run all tests |
| 6 | Upload `playwright-report/` as artifact (retained 30 days) |

> The artifact upload step runs **even if tests fail**, ensuring the HTML report is always available for review after a pipeline run.

---

## 9. Visual Evidence & Screenshots

Screenshots are captured as part of the testing process to document both successful flows and bugs. Existing screenshots include:

| Screenshot | Purpose |
|---|---|
| `booking-desktop-1440.png` | Full-page booking form at desktop viewport |
| `booking-tablet-768.png` | Booking form at tablet viewport |
| `booking-mobile-375.png` | Booking form at mobile viewport |
| `test-empty-validation.png` | Empty form validation error state |
| `receipt-success.png` | Successful booking receipt page |
| `issue1-tabs-wrapping.png` | Bug: navigation tabs wrapping on small screen |
| `issue2-property-cols.png` | Bug: property detail columns misaligned |
| `issue3-checkbox-alignment.png` | Bug: checkbox alignment issue |

Screenshots are used to attach visual proof to bug reports and to verify responsive behaviour across viewports.

---

## 10. Test Progression & Maturity

The AVIHS booking form tests evolved through three clear stages:

1. **`avihsBookingForm.spec.js`** — Exploratory phase. Individual field tests, many commented out after bugs were found. Bug regression tests explicitly marked.

2. **`newBookingForm.spec.js`** — Refining phase. Focus on field presence and visibility. Validation and interaction tests pending.

3. **`newBookingTests.js`** — Production-quality phase. Full structured suite with TC-prefixed test IDs, helper functions, POM patterns, and coverage across auth, UI, validation, dynamics, submission, and dashboard.

---

## 11. Current Gaps & Pending Work

| Area | Status |
|---|---|
| AVIHS CRM (Django backend) | Test scaffold exists, no tests written |
| React Vite apps (property-app, Shine and Drive) | No tests at all |
| Node.js/Express backends | No tests at all |
| Booking form validation tests | Commented out, pending re-implementation after bug fixes |
| Booking form input behaviour tests | Commented out, pending |

---

## 12. Summary

| Aspect | Detail |
|---|---|
| **Primary tool** | Playwright |
| **Primary test type** | End-to-End (E2E) |
| **Primary application** | AVIHS Builders Sales Portal |
| **Browsers** | Chrome, Firefox, Safari |
| **Test count (active)** | 70+ across all files |
| **Patterns used** | Page Object Model, shared helper functions, TC-prefixed naming |
| **Bug tracking** | Embedded in test code as intentional failing tests with comments |
| **CI/CD** | GitHub Actions (Playwright project only) |
| **Reporting** | HTML report with screenshots and video recordings |
