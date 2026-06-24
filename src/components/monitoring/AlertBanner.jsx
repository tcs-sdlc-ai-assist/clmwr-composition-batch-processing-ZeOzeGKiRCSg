import PropTypes from 'prop-types';

/**
 * Formats an ISO 8601 timestamp into a human-readable local date/time string.
 * @param {string} isoTimestamp - The ISO 8601 timestamp string.
 * @returns {string} A formatted date/time string.
 */
function formatTimestamp(isoTimestamp) {
  try {
    const date = new Date(isoTimestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoTimestamp || 'Unknown';
  }
}

/**
 * Returns Tailwind CSS classes for the alert banner based on severity level.
 * @param {string} severity - The alert severity: 'critical', 'warning', or 'info'.
 * @returns {{ container: string, icon: string, title: string, message: string, badge: string, dismissBtn: string }} CSS class strings for each element.
 */
function getSeverityStyles(severity) {
  switch (severity) {
    case 'critical':
      return {
        container: 'bg-error-50 border border-error-300',
        icon: 'bg-error-500 text-white',
        title: 'text-error-800',
        message: 'text-error-700',
        badge: 'bg-error-100 text-error-800',
        dismissBtn: 'text-error-500 hover:text-error-700 hover:bg-error-100',
      };
    case 'warning':
      return {
        container: 'bg-warning-50 border border-warning-300',
        icon: 'bg-warning-500 text-white',
        title: 'text-warning-800',
        message: 'text-warning-700',
        badge: 'bg-warning-100 text-warning-800',
        dismissBtn: 'text-warning-500 hover:text-warning-700 hover:bg-warning-100',
      };
    case 'info':
    default:
      return {
        container: 'bg-brand-50 border border-brand-200',
        icon: 'bg-brand-500 text-white',
        title: 'text-brand-800',
        message: 'text-brand-700',
        badge: 'bg-brand-100 text-brand-800',
        dismissBtn: 'text-brand-500 hover:text-brand-700 hover:bg-brand-100',
      };
  }
}

/**
 * Returns a display label for the severity level.
 * @param {string} severity - The alert severity.
 * @returns {string} The human-readable severity label.
 */
function getSeverityLabel(severity) {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
    default:
      return 'Alert';
  }
}

/**
 * Returns an icon character for the severity level.
 * @param {string} severity - The alert severity.
 * @returns {string} An icon character.
 */
function getSeverityIcon(severity) {
  switch (severity) {
    case 'critical':
      return '!';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return '!';
  }
}

/**
 * AlertBanner — Displays simulated monitoring alerts as dismissible banners.
 * Each alert is rendered with role='alert' and aria-live='assertive' for
 * accessibility. Styled with warning/error colors based on severity.
 * Shows alert message, timestamp, and a dismiss button.
 *
 * User Stories: SCRUM-9791, SCRUM-9785
 *
 * @param {Object} props - Component props.
 * @param {Array<{id: string, timestamp: string, condition: string, message: string, severity: string}>} props.alerts - Array of alert objects to display.
 * @param {function} props.onDismiss - Callback invoked with the alert ID when the dismiss button is clicked.
 * @returns {JSX.Element} The rendered alert banner component.
 */
export function AlertBanner({ alerts, onDismiss }) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" aria-live="assertive">
      {alerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);
        const label = getSeverityLabel(alert.severity);
        const icon = getSeverityIcon(alert.severity);

        return (
          <div
            key={alert.id}
            role="alert"
            className={`rounded-md p-4 ${styles.container}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${styles.icon}`}
                aria-hidden="true"
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${styles.badge}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <p className={`mt-1 text-sm font-medium ${styles.message}`}>
                  {alert.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-medium transition-colors duration-150 focus-ring ${styles.dismissBtn}`}
                aria-label={`Dismiss ${label} alert: ${alert.message}`}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

AlertBanner.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      condition: PropTypes.string,
      message: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['info', 'warning', 'critical']).isRequired,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default AlertBanner;