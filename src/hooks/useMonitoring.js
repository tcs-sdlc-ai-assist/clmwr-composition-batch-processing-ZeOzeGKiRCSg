import { useState, useEffect, useCallback, useRef } from 'react';
import { getFailureStats, getAlerts, clearAlerts } from '../services/monitoringService.js';

/**
 * Default polling interval in milliseconds.
 * @type {number}
 */
const DEFAULT_POLL_INTERVAL_MS = 5000;

/**
 * Custom React hook that provides real-time monitoring state for the dashboard.
 * Polls the monitoringService at configurable intervals to update failure statistics
 * and alerts. Manages alert dismissal state locally.
 *
 * User Stories: SCRUM-9785, SCRUM-9791
 *
 * @param {Object} [options] - Configuration options for the hook.
 * @param {number} [options.pollInterval=5000] - Polling interval in milliseconds.
 * @param {boolean} [options.enabled=true] - Whether polling is active.
 * @returns {{
 *   stats: import('../services/monitoringService.js').FailureStats,
 *   alerts: import('../services/monitoringService.js').Alert[],
 *   refreshStats: () => void,
 *   dismissAlert: (alertId: string) => void,
 *   clearAllAlerts: () => void
 * }} Monitoring state and control functions.
 */
export function useMonitoring(options = {}) {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
  } = options;

  /** @type {[import('../services/monitoringService.js').FailureStats, Function]} */
  const [stats, setStats] = useState({
    totalFailures: 0,
    failuresLastMinute: 0,
    failuresLastHour: 0,
    failuresByField: {},
    trend: 'stable',
  });

  /** @type {[import('../services/monitoringService.js').Alert[], Function]} */
  const [alerts, setAlerts] = useState([]);

  /** @type {React.MutableRefObject<Set<string>>} */
  const dismissedAlertIds = useRef(new Set());

  /**
   * Fetches the latest stats and alerts from the monitoring service,
   * filtering out any locally dismissed alerts.
   */
  const refreshStats = useCallback(() => {
    try {
      const currentStats = getFailureStats();
      setStats(currentStats);
    } catch (error) {
      console.error('[useMonitoring] Failed to fetch failure stats:', error);
    }

    try {
      const currentAlerts = getAlerts();
      const filteredAlerts = currentAlerts.filter(
        (alert) => !dismissedAlertIds.current.has(alert.id)
      );
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('[useMonitoring] Failed to fetch alerts:', error);
    }
  }, []);

  /**
   * Dismisses a single alert by its ID. The alert is hidden locally
   * and will not reappear on subsequent polls.
   *
   * @param {string} alertId - The unique identifier of the alert to dismiss.
   */
  const dismissAlert = useCallback((alertId) => {
    if (!alertId) {
      return;
    }
    dismissedAlertIds.current.add(alertId);
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
  }, []);

  /**
   * Clears all alerts from both the monitoring service persistence
   * and the local state. Also resets the dismissed alert tracking.
   */
  const clearAllAlerts = useCallback(() => {
    try {
      clearAlerts();
    } catch (error) {
      console.error('[useMonitoring] Failed to clear alerts:', error);
    }
    dismissedAlertIds.current.clear();
    setAlerts([]);
  }, []);

  /**
   * Initial fetch on mount and whenever enabled changes.
   */
  useEffect(() => {
    if (enabled) {
      refreshStats();
    }
  }, [enabled, refreshStats]);

  /**
   * Set up polling interval when enabled.
   */
  useEffect(() => {
    if (!enabled || pollInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      refreshStats();
    }, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, pollInterval, refreshStats]);

  return {
    stats,
    alerts,
    refreshStats,
    dismissAlert,
    clearAllAlerts,
  };
}