# Deployment Guide

This document covers deployment of the CLMWR Encoding Validator application to Vercel static hosting, including configuration, environment variables, build commands, and browser requirements.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Commands](#build-commands)
- [Vercel Deployment](#vercel-deployment)
  - [Vercel Git Integration (CI/CD)](#vercel-git-integration-cicd)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Variables](#environment-variables)
- [Preview](#preview)
- [Browser Requirements](#browser-requirements)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- Git repository hosted on GitHub, GitLab, or Bitbucket (for Git integration)

---

## Build Commands

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Starts the Vite development server on `http://localhost:3000` with hot module replacement enabled.

### Run Tests

```bash
npm test
```

Runs all unit and component tests via Vitest.

### Production Build

```bash
npm run build
```

Generates an optimized production build in the `dist/` directory. This command:

- Bundles all JavaScript with tree-shaking and minification via Vite/Rollup
- Processes Tailwind CSS and purges unused utility classes
- Generates source maps for debugging (`build.sourcemap: true` in `vite.config.js`)
- Outputs static assets (HTML, JS, CSS, images) to `dist/`

### Preview Production Build Locally

```bash
npm run preview
```

Serves the `dist/` directory locally to verify the production build before deployment.

---

## Vercel Deployment

### Vercel Git Integration (CI/CD)

The recommended deployment method is Vercel's Git integration, which provides automatic deployments on every push.

#### Setup Steps

1. **Import Project**: Log in to [Vercel](https://vercel.com), click **"Add New Project"**, and import your Git repository (GitHub, GitLab, or Bitbucket).

2. **Configure Build Settings**: Vercel auto-detects Vite projects. Verify the following settings:

   | Setting              | Value           |
   |----------------------|-----------------|
   | **Framework Preset** | Vite            |
   | **Build Command**    | `npm run build` |
   | **Output Directory** | `dist`          |
   | **Install Command**  | `npm install`   |
   | **Node.js Version**  | 18.x or 20.x   |

3. **Set Environment Variables**: Add any required environment variables in the Vercel project dashboard under **Settings > Environment Variables**. See the [Environment Variables](#environment-variables) section below.

4. **Deploy**: Click **"Deploy"**. Vercel will build and deploy the application.

#### Automatic Deployments

Once connected, Vercel automatically:

- **Production deployments**: Triggered on every push to the `main` (or `master`) branch.
- **Preview deployments**: Triggered on every push to any other branch or on pull request creation. Each preview deployment gets a unique URL for testing.

#### Branch Configuration

You can customize which branch triggers production deployments in the Vercel project dashboard under **Settings > Git > Production Branch**.

### Manual Deployment via Vercel CLI

If you prefer manual deployments or need to deploy from a local machine:

1. **Install the Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Log in**:

   ```bash
   vercel login
   ```

3. **Deploy a preview**:

   ```bash
   vercel
   ```

4. **Deploy to production**:

   ```bash
   vercel --prod
   ```

The CLI reads the `vercel.json` configuration file automatically.

---

## SPA Rewrite Configuration

The application uses client-side routing via React Router v6 with `createBrowserRouter`. All routes (e.g., `/screen-a`, `/screen-b`, `/dashboard`) are handled client-side and do not correspond to physical files on the server.

The `vercel.json` file configures Vercel to rewrite all non-asset requests to `index.html`, enabling client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**

- Any request that does **not** start with `/assets/` is rewritten to `/index.html`.
- Requests to `/assets/*` (Vite's default output directory for bundled JS, CSS, and static files) are served directly as static files.
- This ensures that navigating directly to `/screen-b` or refreshing the page on `/dashboard` loads the SPA shell, which then handles routing client-side.

> **Note:** The `vercel.json` file is already included in the repository root. No additional configuration is needed.

---

## Environment Variables

The application supports the following environment variables. All client-side variables must be prefixed with `VITE_` to be exposed to the browser bundle by Vite.

| Variable          | Required | Default                      | Description                                              |
|-------------------|----------|------------------------------|----------------------------------------------------------|
| `VITE_APP_TITLE`  | No       | `CLMWR Encoding Validator`   | Application title displayed in the browser tab and header |

### Setting Environment Variables

#### Local Development

Create a `.env` file in the project root (this file is gitignored):

```bash
cp .env.example .env
```

Edit `.env` as needed:

```
VITE_APP_TITLE=CLMWR Encoding Validator
```

Vite automatically loads `.env` files during development and build. The following files are supported (in order of priority):

- `.env.local` (always loaded, gitignored)
- `.env.[mode].local` (e.g., `.env.development.local`)
- `.env.[mode]` (e.g., `.env.production`)
- `.env`

#### Vercel Dashboard

1. Navigate to your project in the Vercel dashboard.
2. Go to **Settings > Environment Variables**.
3. Add each variable with the appropriate scope:
   - **Production**: Applied to production deployments only.
   - **Preview**: Applied to preview/branch deployments only.
   - **Development**: Applied when using `vercel dev` locally.

> **Important:** Environment variables set in the Vercel dashboard are injected at build time. Changes require a redeployment to take effect.

---

## Preview

### Local Preview

After building the application, you can preview the production build locally:

```bash
npm run build
npm run preview
```

This starts a local static file server (via Vite's preview mode) serving the `dist/` directory. Note that the local preview server does not apply `vercel.json` rewrites — client-side routing may not work for direct URL access in this mode.

### Vercel Preview Deployments

Every pull request and non-production branch push generates a unique preview URL on Vercel. These preview deployments:

- Use the full `vercel.json` configuration including SPA rewrites
- Can have separate environment variables from production
- Are accessible via a unique `*.vercel.app` URL
- Are automatically commented on pull requests (when using GitHub integration)

---

## Browser Requirements

The CLMWR Encoding Validator is a client-side single-page application with the following browser requirements:

### Required Browser Features

| Feature            | Usage                                                        | Support                          |
|--------------------|--------------------------------------------------------------|----------------------------------|
| **localStorage**   | Persists form data, validation logs, and monitoring data     | All modern browsers              |
| **ES2015+ (ES6)**  | Module syntax, arrow functions, template literals, `Set`, `Map` | All modern browsers           |
| **CSS Flexbox**    | Layout via Tailwind CSS utility classes                      | All modern browsers              |
| **CSS Grid**       | Responsive grid layouts                                      | All modern browsers              |
| **SVG**            | Trend chart rendering in the monitoring dashboard            | All modern browsers              |
| **performance.now()** | Validation timing measurement                            | All modern browsers              |

### localStorage Notes

- The application uses `localStorage` with namespaced keys (prefixed with `clmwr_`) for all persistence.
- If `localStorage` is unavailable (e.g., private browsing in some browsers, storage quota exceeded, or disabled by policy), the application degrades gracefully:
  - Form data will not persist across page reloads.
  - Validation logs and monitoring data will not be retained.
  - All core functionality (form rendering, validation, error display) continues to work without `localStorage`.
- The application handles `QuotaExceededError` gracefully and logs warnings to the console.
- No server-side storage or cookies are used.

### Supported Browsers

| Browser                | Minimum Version |
|------------------------|-----------------|
| Google Chrome          | 80+             |
| Mozilla Firefox        | 78+             |
| Microsoft Edge         | 80+             |
| Safari                 | 14+             |
| Safari on iOS          | 14+             |
| Chrome on Android      | 80+             |

> **Note:** Internet Explorer is not supported. The application uses ES module syntax and modern JavaScript APIs that are not available in IE.

---

## Troubleshooting

### Common Issues

#### 404 on Direct URL Access

**Symptom:** Navigating directly to `/screen-a` or `/dashboard` returns a 404 error.

**Cause:** The SPA rewrite rules in `vercel.json` are not being applied.

**Solution:** Ensure `vercel.json` is present in the repository root and contains the rewrite configuration. Redeploy the application.

#### Blank Page After Deployment

**Symptom:** The deployed application shows a blank white page.

**Cause:** Typically a build error or incorrect base path configuration.

**Solution:**
1. Check the Vercel build logs for errors.
2. Ensure `vite.config.js` does not set a custom `base` path (the default `/` is correct for Vercel).
3. Verify that `index.html` references `/src/main.jsx` correctly.

#### Environment Variables Not Working

**Symptom:** `import.meta.env.VITE_APP_TITLE` returns `undefined` in the deployed application.

**Solution:**
1. Ensure the variable is prefixed with `VITE_` (required by Vite to expose to client-side code).
2. Verify the variable is set in the Vercel dashboard for the correct environment (Production/Preview).
3. Redeploy after adding or changing environment variables — they are injected at build time.

#### localStorage Errors in Console

**Symptom:** Console warnings about storage quota exceeded or localStorage unavailability.

**Cause:** The browser's localStorage quota has been reached, or localStorage is disabled.

**Solution:** This is handled gracefully by the application. Clear the browser's site data to free up storage, or ensure localStorage is not disabled by browser settings or extensions.