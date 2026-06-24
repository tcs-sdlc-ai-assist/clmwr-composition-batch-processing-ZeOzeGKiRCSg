import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { ScreenA } from './pages/ScreenA.jsx';
import { ScreenB } from './pages/ScreenB.jsx';
import { MonitoringDashboard } from './pages/MonitoringDashboard.jsx';
import { NotFound } from './pages/NotFound.jsx';

/**
 * Application router configuration using createBrowserRouter.
 * Defines all application routes wrapped in the Layout component.
 *
 * Routes:
 * - '/' — Home landing page
 * - '/screen-a' — Screen A (No Validation)
 * - '/screen-b' — Screen B (Validation Enabled)
 * - '/dashboard' — Monitoring Dashboard
 * - '*' — 404 Not Found
 *
 * User Stories: SCRUM-9782
 *
 * @type {import('react-router-dom').Router}
 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/screen-a',
        element: <ScreenA />,
      },
      {
        path: '/screen-b',
        element: <ScreenB />,
      },
      {
        path: '/dashboard',
        element: <MonitoringDashboard />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;