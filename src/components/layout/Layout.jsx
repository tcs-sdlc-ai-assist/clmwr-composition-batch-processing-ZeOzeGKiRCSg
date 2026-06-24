import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

/**
 * Main layout wrapper component that provides consistent page structure.
 * Renders the global Header, a main content area using React Router's Outlet,
 * and the global Footer. Provides accessibility landmarks via semantic HTML elements.
 *
 * @returns {JSX.Element} The rendered layout component.
 */
export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;