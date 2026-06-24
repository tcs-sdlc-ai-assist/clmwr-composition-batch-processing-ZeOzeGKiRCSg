/**
 * Global footer component with demo disclaimer.
 * Displays a disclaimer that the application uses simulated data only,
 * version information, and a reference date.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p className="text-center sm:text-left">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-warning-400 text-warning-900 uppercase tracking-wide mr-2">
              DEMO ONLY
            </span>
            This application uses simulated data only. No real PII/PHI is present.
          </p>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span>v1.0.0</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Ref: 2024-06-09</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;