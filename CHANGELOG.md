# Changelog

All notable changes to the CLMWR Encoding Validator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-09

### Added

- **Dual Mock UI Screens**
  - **Screen A (No Validation):** Demonstrates the current-state behavior where all Unicode characters are accepted without Codepage 1252 encoding checks. Users can submit any input, including characters that may cause downstream encoding issues.
  - **Screen B (Validation Enabled):** Demonstrates the future-state behavior where all form fields are validated against Codepage 1252 (Windows-1252) encoding on submission. Invalid characters are flagged with detailed error messages showing the character, its Unicode code point (U+XXXX), and position within the field.

- **Codepage 1252 Validation Engine**
  - Pure-function validation service (`validationService.js`) with early-exit optimization for sub-50ms execution on typical form data.
  - Complete Codepage 1252 character set definition (`codepage1252.js`) covering all 251 valid code points (0x00–0xFF excluding undefined positions 0x81, 0x8D, 0x8F, 0x90, 0x9D).
  - Field-level error reporting with invalid character details including character, code point, and position.

- **Simulated Backend Validator**
  - `simulatedBackendValidator.js` wraps the validation engine to mimic a backend API endpoint.
  - Returns structured response objects with `isValid`, `errors`, `processingTimeMs`, `timestamp`, and `simulatedStatusCode` (200 for valid, 422 for invalid, 400 for bad input).
  - Automatically logs validation failures and records them in the monitoring service.

- **Validation Failure Logging**
  - `logService.js` creates structured log entries for each validation failure with unique IDs, ISO 8601 timestamps, field names, invalid character details, and screen type.
  - `ValidationLogPanel` component displays a scrollable, reverse-chronological list of validation log entries with color-coded failure indicators and Unicode code point details.
  - Clear Logs functionality to reset the validation log.

- **localStorage Persistence**
  - `persistenceService.js` abstracts all localStorage operations with namespaced keys (`clmwr_*`) to avoid collisions.
  - Graceful handling of localStorage unavailability and quota exceeded errors.
  - Per-screen form data isolation (Screen A and Screen B maintain independent saved state).
  - Persistence for validation logs and monitoring data across page reloads.

- **Monitoring Dashboard**
  - `FailureStatsCard` component displaying total failures, failures in the last minute, failures in the last hour, trend indicator (increasing/decreasing/stable), and a mini bar chart of failures grouped by field name.
  - `TrendChart` component rendering an SVG-based bar chart of validation failure counts over the last 10 minutes with color-coded severity levels (low, medium, high, critical).
  - `AlertBanner` component displaying dismissible, severity-coded alert banners (info, warning, critical) with `role="alert"` and `aria-live="assertive"` for accessibility.
  - Configurable alert thresholds: high-rate (>3 failures/minute triggers critical), elevated-rate (>10 failures/hour triggers warning), and field-specific (>5 failures per field triggers warning).
  - `useMonitoring` custom hook with configurable polling interval for real-time dashboard updates.
  - Controls for refreshing data, clearing alerts, and resetting all monitoring data.

- **Accessible Error Messaging**
  - `FormField` component with `aria-invalid`, `aria-describedby`, and `role="alert"` attributes for screen reader compatibility.
  - Inline error display with invalid character highlighting showing Unicode code points and positions.
  - Help text support via `aria-describedby` linking.
  - Submission result status banners with `role="status"` for screen reader announcements.

- **Pre-populated Mock Data**
  - Realistic fake claim data (`mockData.js`) with intentional non-Codepage 1252 characters including em dashes (—), smart quotes (" "), right single quotation marks ('), Euro signs (€), bullet points (•), and other Unicode symbols.
  - Human-readable field labels and accessible field descriptions for all form fields.

- **Application Layout and Navigation**
  - Global header with application title, DEMO ONLY badge, and navigation links to Screen A, Screen B, and the Monitoring Dashboard.
  - Global footer with demo disclaimer, version information, and reference date.
  - React Router v6 configuration with `createBrowserRouter` for client-side routing.
  - 404 Not Found page with navigation links back to the home page and screens.
  - Home landing page with application overview, Codepage 1252 explanation, navigation cards, and step-by-step usage guide.

- **Form Controls**
  - Submit button with loading state indicator.
  - Reset to Default button restoring pre-populated mock data.
  - Clear Form button emptying all fields.
  - Error clearing on field modification for immediate user feedback.

- **Custom Hooks**
  - `useLocalStorage` hook with JSON serialization/deserialization, error handling, and cross-tab synchronization via storage events.
  - `useValidation` hook managing validation state, error tracking, field-level error clearing, and performance timing.
  - `useMonitoring` hook with polling, alert dismissal, and alert clearing.

- **Deployment Configuration**
  - Vercel deployment configuration (`vercel.json`) with SPA rewrites for client-side routing support.
  - Vite build configuration with source maps and React plugin.
  - Tailwind CSS configuration with custom color palette (brand, gray, error, success, warning).
  - PostCSS configuration with Tailwind CSS and Autoprefixer plugins.

- **Testing**
  - Unit tests for `validationService` covering valid input, invalid characters, edge cases, performance benchmarks, and undefined Codepage 1252 positions.
  - Unit tests for `persistenceService` covering round-trip persistence, screen isolation, localStorage unavailability, quota exceeded handling, and corrupted data recovery.
  - Unit tests for `monitoringService` covering failure recording, statistics computation, alert generation, alert deduplication, trend computation, and graceful degradation.
  - Unit tests for `simulatedBackendValidator` covering response structure, valid/invalid input, processing time measurement, failure logging integration, and monitoring integration.
  - Component tests for `DemoForm` covering rendering, submission with and without validation, accessibility attributes, error clearing, reset/clear functionality, and localStorage isolation.
  - Vitest configuration with jsdom environment and React Testing Library setup.