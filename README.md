# CLMWR Encoding Validator

A client-side demo application for validating character encodings against **Codepage 1252 (Windows-1252)** in healthcare claim processing workflows. Built with **Vite + React + Tailwind CSS**, this tool demonstrates the impact of encoding validation on form submissions and provides a simulated monitoring dashboard for tracking validation failures.

> **⚠️ DEMO ONLY** — This application uses simulated data only. No real PII/PHI is present. All data is generated locally in the browser using localStorage.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Business Context](#business-context)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [Features](#features)
  - [Codepage 1252 Validation](#codepage-1252-validation)
  - [Simulated Backend Validator](#simulated-backend-validator)
  - [localStorage Persistence](#localstorage-persistence)
  - [Monitoring Dashboard](#monitoring-dashboard)
  - [Validation Failure Logging](#validation-failure-logging)
- [Accessibility](#accessibility)
- [Demo Data Disclaimer](#demo-data-disclaimer)
- [Browser Support](#browser-support)
- [Deployment](#deployment)
- [License](#license)

---

## Project Overview

The CLMWR Encoding Validator provides two side-by-side mock UI screens to demonstrate the difference between accepting all Unicode input (current state) and enforcing Codepage 1252 encoding validation (future state) on healthcare claim form fields. A monitoring dashboard tracks validation failures, displays trend charts, and generates simulated alerts.

The application runs entirely in the browser with no backend — all validation, logging, and monitoring are performed client-side using localStorage for persistence.

---

## Business Context

Many healthcare claim processing systems rely on legacy Codepage 1252 (Windows-1252) encoding. When modern web applications allow users to enter Unicode characters — such as smart quotes (" "), em dashes (—), Euro signs (€), or other symbols — these characters may fall outside the valid Codepage 1252 range (0x00–0xFF, excluding five undefined positions). If submitted to downstream systems expecting Codepage 1252, these characters can cause:

- **Data corruption** in claim records
- **Processing failures** in downstream pipelines
- **Rejected claims** requiring manual intervention

By validating input against Codepage 1252 before submission, encoding issues are caught early with clear, actionable feedback to users about which characters are invalid, their Unicode code points, and their positions within the field.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 18.3.x | UI component library |
| [Vite](https://vitejs.dev/) | 5.4.x | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | Utility-first CSS framework |
| [React Router](https://reactrouter.com/) | 6.26.x | Client-side routing |
| [PropTypes](https://www.npmjs.com/package/prop-types) | 15.8.x | Runtime prop type checking |
| [Vitest](https://vitest.dev/) | 2.1.x | Unit and component testing |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | 16.x | Component testing utilities |
| [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) | 8.4.x / 10.4.x | CSS processing |

---

## Folder Structure

```
clmwr-encoding-validator/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite build configuration
├── vitest.config.js                    # Vitest test configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── vercel.json                         # Vercel deployment configuration
├── .env.example                        # Example environment variables
├── CHANGELOG.md                        # Project changelog
├── DEPLOYMENT.md                       # Deployment guide
├── README.md                           # This file
└── src/
    ├── main.jsx                        # Application entry point
    ├── App.jsx                         # Root component with RouterProvider
    ├── router.jsx                      # React Router configuration
    ├── index.css                       # Global styles and Tailwind directives
    ├── constants/
    │   ├── codepage1252.js             # Codepage 1252 character set definition
    │   └── mockData.js                 # Pre-populated form data and field labels
    ├── components/
    │   ├── form/
    │   │   ├── DemoForm.jsx            # Core demo form with validation integration
    │   │   ├── DemoForm.test.jsx       # DemoForm component tests
    │   │   └── FormField.jsx           # Reusable accessible form field component
    │   ├── layout/
    │   │   ├── Header.jsx              # Global navigation header
    │   │   ├── Footer.jsx              # Global footer with disclaimer
    │   │   └── Layout.jsx              # Page layout wrapper with Outlet
    │   ├── logging/
    │   │   └── ValidationLogPanel.jsx  # Scrollable validation log display
    │   └── monitoring/
    │       ├── AlertBanner.jsx         # Dismissible alert banners
    │       ├── FailureStatsCard.jsx    # Failure statistics card
    │       └── TrendChart.jsx          # SVG-based trend bar chart
    ├── hooks/
    │   ├── useLocalStorage.js          # localStorage sync with cross-tab support
    │   ├── useMonitoring.js            # Real-time monitoring state with polling
    │   └── useValidation.js            # Validation state management
    ├── pages/
    │   ├── Home.jsx                    # Landing page with overview and navigation
    │   ├── ScreenA.jsx                 # Screen A — No Validation (current state)
    │   ├── ScreenB.jsx                 # Screen B — Validation Enabled (future state)
    │   ├── MonitoringDashboard.jsx     # Monitoring dashboard page
    │   └── NotFound.jsx                # 404 page
    ├── services/
    │   ├── validationService.js        # Codepage 1252 validation engine
    │   ├── validationService.test.js   # Validation service tests
    │   ├── simulatedBackendValidator.js # Simulated backend validation endpoint
    │   ├── simulatedBackendValidator.test.js # Simulated backend tests
    │   ├── logService.js               # Validation failure logging
    │   ├── persistenceService.js       # localStorage abstraction layer
    │   ├── persistenceService.test.js  # Persistence service tests
    │   ├── monitoringService.js        # Failure tracking and alert generation
    │   └── monitoringService.test.js   # Monitoring service tests
    └── test/
        └── setup.js                    # Test setup (jest-dom matchers)
```

---

## Setup Instructions

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd clmwr-encoding-validator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to customize the application title if desired:

   ```
   VITE_APP_TITLE=CLMWR Encoding Validator
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will open at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Starts the Vite development server on port 3000 with hot module replacement |
| **build** | `npm run build` | Creates an optimized production build in the `dist/` directory |
| **preview** | `npm run preview` | Serves the production build locally for verification |
| **test** | `npm test` | Runs all unit and component tests via Vitest |
| **test:watch** | `npm run test:watch` | Runs tests in watch mode for development |

---

## Routes

The application uses React Router v6 with `createBrowserRouter` for client-side routing. All routes are wrapped in a shared `Layout` component that provides the global header and footer.

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page with application overview, Codepage 1252 explanation, navigation cards, and step-by-step usage guide |
| `/screen-a` | Screen A | **Current State — No Validation.** Demonstrates the current behavior where all Unicode characters are accepted without Codepage 1252 checks. Any input is submitted successfully. |
| `/screen-b` | Screen B | **Future State — Validation Enabled.** Demonstrates the future behavior where all form fields are validated against Codepage 1252 encoding on submission. Invalid characters are flagged with detailed error messages. |
| `/dashboard` | Monitoring Dashboard | Displays simulated monitoring data including failure statistics, trend charts, alert banners, and a full validation log panel. |
| `*` | 404 Not Found | Friendly error page with navigation links back to the home page and screens |

---

## Features

### Codepage 1252 Validation

- **Pure-function validation engine** (`validationService.js`) with early-exit optimization for sub-50ms execution on typical form data
- **Complete Codepage 1252 character set** (`codepage1252.js`) covering all 251 valid code points (0x00–0xFF excluding undefined positions 0x81, 0x8D, 0x8F, 0x90, 0x9D)
- **Field-level error reporting** with invalid character details including the character itself, its Unicode code point (U+XXXX), and zero-based position within the field
- **Descriptive error messages** that clearly identify which characters are invalid and where they appear

### Simulated Backend Validator

- `simulatedBackendValidator.js` wraps the validation engine to mimic a backend API endpoint
- Returns structured response objects with:
  - `isValid` — Whether the payload passed validation
  - `errors` — Array of field-level validation errors
  - `processingTimeMs` — Measured processing time in milliseconds
  - `timestamp` — ISO 8601 timestamp
  - `simulatedStatusCode` — Simulated HTTP status code (200 for valid, 422 for invalid, 400 for bad input)
- Automatically logs validation failures and records them in the monitoring service

### localStorage Persistence

- `persistenceService.js` abstracts all localStorage operations with namespaced keys (`clmwr_*`) to avoid collisions with other applications
- **Per-screen form data isolation** — Screen A and Screen B maintain independent saved state
- **Persistence across page reloads** for form data, validation logs, and monitoring data
- **Graceful degradation** when localStorage is unavailable (e.g., private browsing, quota exceeded, disabled by policy)
- **QuotaExceededError handling** with console warnings

### Monitoring Dashboard

- **FailureStatsCard** — Displays total failures, failures in the last minute, failures in the last hour, trend indicator (increasing/decreasing/stable), and a mini bar chart of failures grouped by field name
- **TrendChart** — SVG-based bar chart of validation failure counts over the last 10 minutes with color-coded severity levels (low, medium, high, critical)
- **AlertBanner** — Dismissible, severity-coded alert banners (info, warning, critical) with configurable thresholds:
  - **Critical:** >3 failures per minute
  - **Warning:** >10 failures per hour
  - **Warning:** >5 failures for a single field
- **Real-time updates** via the `useMonitoring` hook with configurable polling interval
- **Controls** for refreshing data, clearing alerts, and resetting all monitoring data

### Validation Failure Logging

- `logService.js` creates structured log entries for each validation failure with unique IDs, ISO 8601 timestamps, field names, invalid character details, and screen type
- **ValidationLogPanel** component displays a scrollable, reverse-chronological list of validation log entries with color-coded failure indicators and Unicode code point details
- **Clear Logs** functionality to reset the validation log

---

## Accessibility

The application follows accessibility best practices to ensure usability with screen readers and assistive technologies:

- **Semantic HTML** — Uses `<header>`, `<main>`, `<footer>`, `<nav>`, `<form>`, `<label>`, `<ul>`, `<ol>`, and other semantic elements
- **ARIA attributes** on form fields:
  - `aria-invalid="true"` on fields with validation errors
  - `aria-describedby` linking inputs to their error messages and help text
  - `role="alert"` on inline error messages for immediate screen reader announcements
- **Status announcements** — Submission result banners use `role="status"` for screen reader announcements
- **Alert banners** — Use `role="alert"` and `aria-live="assertive"` for critical monitoring alerts
- **Validation log** — Uses `aria-live="polite"` for non-intrusive updates
- **Keyboard navigation** — All interactive elements are focusable with visible focus indicators (`focus-ring` utility)
- **Descriptive labels** — All form fields have associated `<label>` elements with human-readable text
- **Navigation landmarks** — `aria-label="Main navigation"` on the nav element

---

## Demo Data Disclaimer

> **⚠️ DEMO ONLY — No Real PII/PHI**

This application is a demonstration tool only. All data displayed in the application is **simulated and fictional**:

- **Mock claim data** is pre-populated with realistic but entirely fake values
- **Member names, provider names, addresses, and claim IDs** are fictional and do not correspond to any real individuals or organizations
- **No real Protected Health Information (PHI) or Personally Identifiable Information (PII)** is used anywhere in the application
- **All validation logs, monitoring data, and alerts** are generated locally in the browser based on user interactions within the demo
- **No data is transmitted to any server** — the application runs entirely client-side

The mock data intentionally includes non-Codepage 1252 characters (em dashes, smart quotes, Unicode symbols) to exercise the encoding validation functionality.

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Google Chrome | 80+ |
| Mozilla Firefox | 78+ |
| Microsoft Edge | 80+ |
| Safari | 14+ |
| Safari on iOS | 14+ |
| Chrome on Android | 80+ |

Internet Explorer is **not supported**. The application uses ES module syntax and modern JavaScript APIs that are not available in IE.

---

## Deployment

The application is configured for deployment to **Vercel** as a static single-page application. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions, including:

- Vercel Git integration (CI/CD) setup
- Manual deployment via Vercel CLI
- SPA rewrite configuration for client-side routing
- Environment variable configuration
- Troubleshooting common deployment issues

---

## License

This project is private and proprietary.