/**
 * MonitoringService — Tracks validation failure frequency and generates simulated alerts.
 * Provides failure statistics, trend analysis, and configurable alert thresholds.
 *
 * User Stories: SCRUM-9781, SCRUM-9785, SCRUM-9791
 */

import { saveMonitoring, loadMonitoring } from './persistenceService.js';

/**
 * @typedef {Object} FailureRecord
 * @property {string} id - The log entry ID.
 * @property {string} timestamp - ISO 8601 timestamp of the failure.
 * @property {string} field - The field name that failed validation.
 * @property {string} screenType - The screen where the failure occurred.
 */

/**
 * @typedef {Object} FailureStats
 * @property {number} totalFailures - Total number of recorded failures.
 * @property {number} failuresLastMinute - Number of failures in the last 60 seconds.
 * @property {number} failuresLastHour - Number of failures in the last 3600 seconds.
 * @property {Object.<string, number>} failuresByField - Failure count grouped by field name.
 * @property {string} trend - Trend indicator: 'increasing', 'decreasing', or 'stable'.
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - Unique identifier for the alert.
 * @property {string} timestamp - ISO 8601 timestamp when the alert was generated.
 * @property {string} condition - The condition that triggered the alert.
 * @property {string} message - Human-readable alert message.
 * @property {string} severity - Alert severity: 'warning', 'critical', or 'info'.
 */

/**
 * @typedef {Object} MonitoringState
 * @property {FailureRecord[]} failureRecords - Array of recorded failure entries.
 * @property {Alert[]} alerts - Array of active alerts.
 */

/**
 * Alert threshold constants.
 * @type {Object}
 */
const THRESHOLDS = {
  /** Number of failures in the last minute to trigger a high-rate alert. */
  HIGH_RATE_PER_MINUTE: 3,
  /** Number of failures in the last hour to trigger an elevated-rate alert. */
  ELEVATED_RATE_PER_HOUR: 10,
  /** Number of failures for a single field to trigger a field-specific alert. */
  FIELD_FAILURE_COUNT: 5,
};

/**
 * Duration constants in milliseconds.
 * @type {Object}
 */
const DURATIONS = {
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  /** Window for trend comparison (last 5 minutes split into two halves). */
  TREND_WINDOW_MS: 5 * 60 * 1000,
};

/**
 * Generates a unique ID for an alert.
 * @returns {string} A unique identifier string.
 */
function generateAlertId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `alert-${timestamp}-${random}`;
}

/**
 * Loads the current monitoring state from persistence.
 * @returns {MonitoringState} The current monitoring state.
 */
function loadState() {
  const stored = loadMonitoring();
  if (stored && typeof stored === 'object') {
    return {
      failureRecords: Array.isArray(stored.failureRecords) ? stored.failureRecords : [],
      alerts: Array.isArray(stored.alerts) ? stored.alerts : [],
    };
  }
  return { failureRecords: [], alerts: [] };
}

/**
 * Persists the current monitoring state.
 * @param {MonitoringState} state - The monitoring state to save.
 * @returns {boolean} True if the save succeeded, false otherwise.
 */
function saveState(state) {
  return saveMonitoring(state);
}

/**
 * Counts failures within a given time window from now.
 * @param {FailureRecord[]} records - Array of failure records.
 * @param {number} windowMs - Time window in milliseconds.
 * @returns {number} Number of failures within the window.
 */
function countFailuresInWindow(records, windowMs) {
  const cutoff = Date.now() - windowMs;
  let count = 0;
  for (let i = 0; i < records.length; i++) {
    const recordTime = new Date(records[i].timestamp).getTime();
    if (recordTime >= cutoff) {
      count++;
    }
  }
  return count;
}

/**
 * Computes failure counts grouped by field name.
 * @param {FailureRecord[]} records - Array of failure records.
 * @returns {Object.<string, number>} Map of field name to failure count.
 */
function computeFailuresByField(records) {
  const byField = {};
  for (let i = 0; i < records.length; i++) {
    const field = records[i].field;
    if (field) {
      byField[field] = (byField[field] || 0) + 1;
    }
  }
  return byField;
}

/**
 * Determines the failure trend by comparing the first and second halves
 * of the trend window.
 * @param {FailureRecord[]} records - Array of failure records.
 * @returns {string} 'increasing', 'decreasing', or 'stable'.
 */
function computeTrend(records) {
  const now = Date.now();
  const halfWindow = DURATIONS.TREND_WINDOW_MS / 2;
  const midpoint = now - halfWindow;
  const windowStart = now - DURATIONS.TREND_WINDOW_MS;

  let olderHalfCount = 0;
  let newerHalfCount = 0;

  for (let i = 0; i < records.length; i++) {
    const recordTime = new Date(records[i].timestamp).getTime();
    if (recordTime >= windowStart && recordTime < midpoint) {
      olderHalfCount++;
    } else if (recordTime >= midpoint && recordTime <= now) {
      newerHalfCount++;
    }
  }

  if (newerHalfCount > olderHalfCount) {
    return 'increasing';
  }
  if (newerHalfCount < olderHalfCount) {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Records a validation failure from a log entry and updates monitoring state.
 * Automatically checks alert thresholds after recording.
 *
 * @param {import('./logService.js').LogEntry} logEntry - The log entry to record.
 * @returns {FailureRecord} The recorded failure entry.
 */
export function recordFailure(logEntry) {
  if (!logEntry || typeof logEntry !== 'object') {
    return null;
  }

  const state = loadState();

  /** @type {FailureRecord} */
  const record = {
    id: logEntry.id || generateAlertId(),
    timestamp: logEntry.timestamp || new Date().toISOString(),
    field: logEntry.field || '',
    screenType: logEntry.screenType || '',
  };

  state.failureRecords.push(record);

  // Check thresholds and generate alerts
  const failuresLastMinute = countFailuresInWindow(state.failureRecords, DURATIONS.ONE_MINUTE_MS);
  const failuresLastHour = countFailuresInWindow(state.failureRecords, DURATIONS.ONE_HOUR_MS);
  const failuresByField = computeFailuresByField(state.failureRecords);

  if (failuresLastMinute >= THRESHOLDS.HIGH_RATE_PER_MINUTE) {
    const condition = `high_rate_per_minute:${failuresLastMinute}`;
    const existingAlert = state.alerts.find(
      (a) => a.condition.startsWith('high_rate_per_minute')
    );
    if (!existingAlert) {
      state.alerts.push(generateAlert(
        condition,
        `High failure rate: >${THRESHOLDS.HIGH_RATE_PER_MINUTE - 1} failures in last minute (current: ${failuresLastMinute})`,
        'critical'
      ));
    }
  }

  if (failuresLastHour >= THRESHOLDS.ELEVATED_RATE_PER_HOUR) {
    const condition = `elevated_rate_per_hour:${failuresLastHour}`;
    const existingAlert = state.alerts.find(
      (a) => a.condition.startsWith('elevated_rate_per_hour')
    );
    if (!existingAlert) {
      state.alerts.push(generateAlert(
        condition,
        `Elevated failure rate: >${THRESHOLDS.ELEVATED_RATE_PER_HOUR - 1} failures in last hour (current: ${failuresLastHour})`,
        'warning'
      ));
    }
  }

  const fieldKeys = Object.keys(failuresByField);
  for (let i = 0; i < fieldKeys.length; i++) {
    const fieldName = fieldKeys[i];
    const fieldCount = failuresByField[fieldName];
    if (fieldCount >= THRESHOLDS.FIELD_FAILURE_COUNT) {
      const condition = `field_failure:${fieldName}`;
      const existingAlert = state.alerts.find(
        (a) => a.condition === condition
      );
      if (!existingAlert) {
        state.alerts.push(generateAlert(
          condition,
          `Field "${fieldName}" has ${fieldCount} validation failures (threshold: ${THRESHOLDS.FIELD_FAILURE_COUNT})`,
          'warning'
        ));
      }
    }
  }

  saveState(state);

  return record;
}

/**
 * Returns current failure statistics including counts, field breakdown, and trend.
 *
 * @returns {FailureStats} The current failure statistics.
 */
export function getFailureStats() {
  const state = loadState();
  const records = state.failureRecords;

  return {
    totalFailures: records.length,
    failuresLastMinute: countFailuresInWindow(records, DURATIONS.ONE_MINUTE_MS),
    failuresLastHour: countFailuresInWindow(records, DURATIONS.ONE_HOUR_MS),
    failuresByField: computeFailuresByField(records),
    trend: computeTrend(records),
  };
}

/**
 * Returns all active alerts.
 *
 * @returns {Alert[]} Array of active alert objects.
 */
export function getAlerts() {
  const state = loadState();
  return Array.isArray(state.alerts) ? state.alerts : [];
}

/**
 * Clears all active alerts from the monitoring state.
 *
 * @returns {boolean} True if the alerts were successfully cleared, false otherwise.
 */
export function clearAlerts() {
  const state = loadState();
  state.alerts = [];
  return saveState(state);
}

/**
 * Generates a structured alert object for a given condition.
 *
 * @param {string} condition - The condition identifier that triggered the alert.
 * @param {string} [message] - Human-readable alert message. Defaults to the condition string.
 * @param {string} [severity='warning'] - Alert severity: 'info', 'warning', or 'critical'.
 * @returns {Alert} The generated alert object.
 */
export function generateAlert(condition, message, severity) {
  const normalizedSeverity = ['info', 'warning', 'critical'].includes(severity)
    ? severity
    : 'warning';

  return {
    id: generateAlertId(),
    timestamp: new Date().toISOString(),
    condition: String(condition || ''),
    message: String(message || condition || ''),
    severity: normalizedSeverity,
  };
}