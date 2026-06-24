import { Link } from 'react-router-dom';

/**
 * Landing/home page component for the CLMWR Encoding Validator demo.
 * Provides an overview of the application, explains the purpose of Screen A
 * vs Screen B, and offers navigation cards to each screen and the monitoring
 * dashboard. Includes a summary of Codepage 1252 and why validation matters.
 *
 * @returns {JSX.Element} The rendered home page component.
 */
export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          CLMWR Encoding Validator
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          A demo application for validating character encodings against Codepage 1252
          (Windows-1252) in healthcare claim processing workflows.
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-warning-100 text-warning-800 uppercase tracking-wide">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-warning-400 text-warning-900 uppercase tracking-wide mr-2">
            DEMO ONLY
          </span>
          No real PII/PHI is used — all data is simulated
        </div>
      </div>

      {/* What is Codepage 1252 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            What is Codepage 1252?
          </h2>
        </div>
        <div className="px-4 py-4 sm:px-6 space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-gray-900">Codepage 1252</span> (also known as
            Windows-1252) is a single-byte character encoding used extensively in legacy systems,
            including many healthcare claim processing platforms. It supports 251 characters in the
            range 0x00–0xFF, with five undefined positions (0x81, 0x8D, 0x8F, 0x90, 0x9D).
          </p>
          <p>
            When modern applications allow users to enter Unicode characters — such as smart quotes
            (" "), em dashes (—), Euro signs (€), or other symbols — these characters may fall
            outside the valid Codepage 1252 range. If submitted to downstream systems that expect
            Codepage 1252 encoding, these characters can cause data corruption, processing failures,
            or rejected claims.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Why validation matters:</span> By
            validating input against Codepage 1252 before submission, we can catch encoding issues
            early, provide clear feedback to users about which characters are invalid, and prevent
            costly downstream failures in claim processing pipelines.
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Explore the Demo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Screen A Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-brand-500 text-white"
                  aria-hidden="true"
                >
                  A
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Screen A
                </h3>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 flex-1">
              <p className="text-sm font-semibold text-brand-800 mb-2">
                Current State — No Validation
              </p>
              <p className="text-sm text-gray-600">
                Demonstrates the current behavior where all characters are accepted without
                Codepage 1252 checks. Any Unicode character can be submitted, including
                characters that may cause encoding issues downstream. Use this screen to see
                what happens when validation is absent.
              </p>
            </div>
            <div className="px-4 py-4 sm:px-6 border-t border-gray-100">
              <Link
                to="/screen-a"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus-ring transition-colors duration-150"
              >
                Open Screen A
              </Link>
            </div>
          </div>

          {/* Screen B Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-success-500 text-white"
                  aria-hidden="true"
                >
                  B
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Screen B
                </h3>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 flex-1">
              <p className="text-sm font-semibold text-success-800 mb-2">
                Future State — Validation Enabled
              </p>
              <p className="text-sm text-gray-600">
                Demonstrates the future state where all form fields are validated against
                Codepage 1252 encoding on submission. Invalid characters are flagged with
                detailed error messages showing the character, its Unicode code point, and
                position. Compare with Screen A to see the difference.
              </p>
            </div>
            <div className="px-4 py-4 sm:px-6 border-t border-gray-100">
              <Link
                to="/screen-b"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-success-600 hover:bg-success-700 focus-ring transition-colors duration-150"
              >
                Open Screen B
              </Link>
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-warning-500 text-white"
                  aria-hidden="true"
                >
                  ⚠
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Monitoring Dashboard
                </h3>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 flex-1">
              <p className="text-sm font-semibold text-warning-800 mb-2">
                Simulated Monitoring View
              </p>
              <p className="text-sm text-gray-600">
                View simulated monitoring data including failure statistics, trend charts,
                alert banners, and validation logs. All data is generated locally based on
                validation activity within the demo. Submit forms on Screen A and Screen B
                to generate events that appear here.
              </p>
            </div>
            <div className="px-4 py-4 sm:px-6 border-t border-gray-100">
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus-ring transition-colors duration-150"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            How It Works
          </h2>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-brand-100 text-brand-700"
                aria-hidden="true"
              >
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Enter Claim Data</p>
                <p className="text-sm text-gray-600">
                  Both screens are pre-populated with realistic fake claim data that intentionally
                  contains non-Codepage 1252 characters such as smart quotes, em dashes, and
                  Unicode symbols.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-brand-100 text-brand-700"
                aria-hidden="true"
              >
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Submit the Form</p>
                <p className="text-sm text-gray-600">
                  On Screen A, all input is accepted without validation. On Screen B, each field
                  is checked against the Codepage 1252 character set before submission is accepted.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-brand-100 text-brand-700"
                aria-hidden="true"
              >
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Review Validation Results</p>
                <p className="text-sm text-gray-600">
                  When validation is enabled (Screen B), invalid characters are highlighted with
                  their Unicode code points and positions. Validation failures are logged and
                  tracked on the Monitoring Dashboard.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-brand-100 text-brand-700"
                aria-hidden="true"
              >
                4
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Monitor Trends</p>
                <p className="text-sm text-gray-600">
                  The Monitoring Dashboard displays failure statistics, trend charts, and
                  simulated alerts based on validation activity. All data persists in
                  localStorage for the duration of the demo session.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Home;