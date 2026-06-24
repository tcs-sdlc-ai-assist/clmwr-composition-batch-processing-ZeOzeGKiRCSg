import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';

/**
 * Root application component.
 * Renders RouterProvider with the router configuration from router.jsx.
 * Wraps the app in any necessary context providers (if needed in future).
 * Minimal component that bootstraps the SPA.
 *
 * @returns {JSX.Element} The rendered root application component.
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;