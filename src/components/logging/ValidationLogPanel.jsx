import { useState, useEffect, useCallback } from 'react';
import { getLogs, clearLogs } from '../../services/logService.js';

/**
 * Formats a Unicode code point as a U+XXXX string.
 * @param {number} codePoint - The numeric code point.
 * @returns {string} The formatted code point string.
 */
function formatCodePoint(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

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
 * ValidationLogPanel — Displays a scrollable list of validation log entries.
 * Reads from logService.getLogs() and renders each entry with timestamp,
 * screen type, field name, invalid characters with Unicode code points,
 * and validation result. Includes a Clear Logs button.
 *
 * Uses aria-live='polite' for screen reader announcements of new entries.
 * Entries are color-coded: red for failures.
 *
 * User Stories: SCRUM-9781, SCRUM-9787, SCRUM-9788
 *
 * @returns {JSX.Element} The rendered validation log panel component.
 */
export function ValidationLogPanel() {
  const [logs, setLogs] = useState([]);

  /**
   * Fetches the latest logs from the log service.
   */
  const refreshLogs = useCallback(() => {
    try {
      const currentLogs = getLogs();
      setLogs(Array.isArray(currentLogs) ? currentLogs : []);
    } catch (error) {
      console.error('[ValidationLogPanel] Failed to fetch logs:', error);
      setLogs([]);
    }
  }, []);

  /**
   * Fetch logs on mount and set up a polling interval.
   */
  useEffect(() => {
    refreshLogs();

    const intervalId = setInterval(() => {
      refreshLogs();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshLogs]);

  /**
   * Handles clearing all logs via the log service and refreshing local state.
   */
  const handleClearLogs = useCallback(() => {
    try {
      clearLogs();
      setLogs([]);
    } catch (error) {
      console.error('[ValidationLogPanel] Failed to clear logs:', error);
    }
  }, []);

  /**
   * Renders the invalid characters detail for a single log entry.
   * @param {Array<{char: string, codePoint: number, position: number}>} invalidChars - The invalid character details.
   * @returns {JSX.Element|null} The rendered invalid characters list, or null.
   */
  const renderInvalidChars = (invalidChars) => {
    if (!Array.isArray(invalidChars) || invalidChars.length === 0) {
      return null;
    }

    return (
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {invalidChars.map((ic, index) => (
          <li
            key={`${ic.codePoint}-${ic.position}-${index}`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-error-100 text-error-700 text-xs font-mono"
          >
            <span className="font-bold">{ic.char}</span>
            <span>{formatCodePoint(ic.codePoint)}</span>
            <span className="text-error-500">@{ic.position}</span>
          </li>
        ))}
      </ul>
    );
  };

  /**
   * Renders a single log entry row.
   * @param {import('../../services/logService.js').LogEntry} entry - The log entry to render.
   * @returns {JSX.Element} The rendered log entry.
   */
  const renderLogEntry = (entry) => {
    const hasInvalidChars = Array.isArray(entry.invalidChars) && entry.invalidChars.length > 0;

    return (
      <li
        key={entry.id}
        className="border border-error-200 bg-error-50 rounded-md p-3 space-y-1"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-error-500 text-white uppercase">
            Failure
          </span>
          <span className="text-gray-500 font-mono">
            {formatTimestamp(entry.timestamp)}
          </span>
          {entry.screenType && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 text-xs font-semibold uppercase">
              Screen {entry.screenType.toUpperCase()}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-800">
          <span className="font-medium text-gray-600">Field: </span>
          <span className="font-semibold text-gray-900">{entry.field}</span>
        </div>

        {entry.message && (
          <p className="text-xs text-error-600">{entry.message}</p>
        )}

        {hasInvalidChars && (
          <div>
            <span className="text-xs font-medium text-gray-600">Invalid Characters:</span>
            {renderInvalidChars(entry.invalidChars)}
          </div>
        )}
      </li>
    );
  };

  const reversedLogs = [...logs].reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Validation Logs
          {logs.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-700">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-error-700 bg-white border border-error-300 hover:bg-error-50 focus-ring transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
        >
          Clear Logs
        </button>
      </div>

      <div
        aria-live="polite"
        aria-label="Validation log entries"
        className="max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white p-3"
      >
        {reversedLogs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            <p>No validation log entries yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reversedLogs.map((entry) => renderLogEntry(entry))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ValidationLogPanel;