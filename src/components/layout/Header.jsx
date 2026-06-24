import { NavLink } from 'react-router-dom';

const appTitle = import.meta.env.VITE_APP_TITLE || 'CLMWR Encoding Validator';

/**
 * Global navigation header component.
 * Displays the application title, a [DEMO ONLY] badge, and navigation links
 * to Screen A, Screen B, and the Monitoring Dashboard.
 * Uses React Router NavLink for active state styling.
 *
 * User Stories: SCRUM-9782
 *
 * @returns {JSX.Element} The rendered header component.
 */
export function Header() {
  /**
   * Generates className for NavLink based on active state.
   * @param {{ isActive: boolean }} params - NavLink render props.
   * @returns {string} Tailwind class string.
   */
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'px-3 py-2 rounded-md text-sm font-semibold text-white bg-brand-700 transition-colors duration-150'
      : 'px-3 py-2 rounded-md text-sm font-medium text-brand-100 hover:text-white hover:bg-brand-500 transition-colors duration-150';

  return (
    <header className="bg-brand-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2 text-white no-underline">
              <span className="text-lg font-bold tracking-tight">{appTitle}</span>
            </NavLink>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-warning-400 text-warning-900 uppercase tracking-wide">
              DEMO ONLY
            </span>
          </div>

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <NavLink to="/screen-a" className={navLinkClass}>
              Screen A
            </NavLink>
            <NavLink to="/screen-b" className={navLinkClass}>
              Screen B
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;