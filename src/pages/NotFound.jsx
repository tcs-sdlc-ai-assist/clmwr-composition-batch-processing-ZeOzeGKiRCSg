import { Link } from 'react-router-dom';

/**
 * 404 Not Found page component.
 * Displays a friendly message and a link back to the home page when users
 * navigate to an undefined route.
 *
 * @returns {JSX.Element} The rendered 404 page component.
 */
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Page Not Found
        </h1>
        <p className="text-base text-gray-600 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to the home page.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus-ring transition-colors duration-150"
        >
          Go to Home
        </Link>
        <Link
          to="/screen-a"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus-ring transition-colors duration-150"
        >
          Open Screen A
        </Link>
        <Link
          to="/screen-b"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus-ring transition-colors duration-150"
        >
          Open Screen B
        </Link>
      </div>
    </div>
  );
}

export default NotFound;