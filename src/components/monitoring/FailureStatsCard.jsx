import PropTypes from 'prop-types';

/**
 * Returns a Tailwind CSS class for the trend indicator.
 * @param {string} trend - The trend direction: 'increasing', 'decreasing', or 'stable'.
 * @returns {{ label: string, colorClass: string, icon: string }} Trend display properties.
 */
function getTrendDisplay(trend) {
  switch (trend) {
    case 'increasing':
      return {
        label: 'Increasing',
        colorClass: 'text-error-600',
        icon: '↑',
      };
    case 'decreasing':
      return {
        label: 'Decreasing',
        colorClass: 'text-success-600',
        icon: '↓',
      };
    case 'stable':
    default:
      return {
        label: 'Stable',
        colorClass: 'text-gray-500',
        icon: '→',
      };
  }
}

/**
 * Computes the percentage width for a bar in the field breakdown chart.
 * @param {number} count - The failure count for the field.
 * @param {number} maxCount - The maximum failure count across all fields.
 * @returns {number} A percentage value between 0 and 100.
 */
function computeBarWidth(count, maxCount) {
  if (maxCount <= 0) {
    return 0;
  }
  return Math.max(Math.round((count / maxCount) * 100), 4);
}

/**
 * FailureStatsCard — Displays validation failure statistics in a card layout.
 * Shows total failures, failures in the last minute, failures in the last hour,
 * trend indicator, and a mini bar chart of failures grouped by field name.
 *
 * User Stories: SCRUM-9791, SCRUM-9785
 *
 * @param {Object} props - Component props.
 * @param {Object} props.stats - Failure statistics object from monitoringService.getFailureStats().
 * @param {number} props.stats.totalFailures - Total number of recorded failures.
 * @param {number} props.stats.failuresLastMinute - Number of failures in the last 60 seconds.
 * @param {number} props.stats.failuresLastHour - Number of failures in the last 3600 seconds.
 * @param {Object.<string, number>} props.stats.failuresByField - Failure count grouped by field name.
 * @param {string} props.stats.trend - Trend indicator: 'increasing', 'decreasing', or 'stable'.
 * @returns {JSX.Element} The rendered failure statistics card component.
 */
export function FailureStatsCard({ stats }) {
  const {
    totalFailures = 0,
    failuresLastMinute = 0,
    failuresLastHour = 0,
    failuresByField = {},
    trend = 'stable',
  } = stats || {};

  const trendDisplay = getTrendDisplay(trend);

  const fieldEntries = Object.entries(failuresByField).sort(
    (a, b) => b[1] - a[1]
  );

  const maxFieldCount = fieldEntries.length > 0
    ? Math.max(...fieldEntries.map((entry) => entry[1]))
    : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Failure Statistics
          </h3>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${trendDisplay.colorClass}`}>
              {trendDisplay.icon}
            </span>
            <span className={`text-xs font-medium ${trendDisplay.colorClass}`}>
              {trendDisplay.label}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Failures
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalFailures}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Last Minute
            </p>
            <p className={`mt-1 text-2xl font-bold ${failuresLastMinute > 0 ? 'text-error-600' : 'text-gray-900'}`}>
              {failuresLastMinute}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Last Hour
            </p>
            <p className={`mt-1 text-2xl font-bold ${failuresLastHour > 0 ? 'text-warning-600' : 'text-gray-900'}`}>
              {failuresLastHour}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Failures by Field
          </h4>

          {fieldEntries.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-sm text-gray-400">
              <p>No field-level failure data available.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {fieldEntries.map(([fieldName, count]) => {
                const barWidth = computeBarWidth(count, maxFieldCount);

                return (
                  <li key={fieldName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 truncate max-w-[60%]">
                        {fieldName}
                      </span>
                      <span className="font-mono font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-error-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                        role="presentation"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

FailureStatsCard.propTypes = {
  stats: PropTypes.shape({
    totalFailures: PropTypes.number,
    failuresLastMinute: PropTypes.number,
    failuresLastHour: PropTypes.number,
    failuresByField: PropTypes.objectOf(PropTypes.number),
    trend: PropTypes.oneOf(['increasing', 'decreasing', 'stable']),
  }).isRequired,
};

export default FailureStatsCard;