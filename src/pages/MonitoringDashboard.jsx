import { useState, useCallback } from 'react';
import { FailureStatsCard } from '../components/monitoring/FailureStatsCard.jsx';
import { TrendChart } from '../components/monitoring/TrendChart.jsx';
import { AlertBanner } from '../components/monitoring/AlertBanner.jsx';
import { ValidationLogPanel } from '../components/logging/ValidationLogPanel.jsx';
import { useMonitoring } from '../hooks/useMonitoring.js';
import { clearAll } from '../services/persistenceService.js';

/**
 * Generates trend data points from failure stats for the TrendChart component.
 * Creates simulated minute-by-minute data based on the current failure statistics.
 *
 * @param {import('../services/monitoringService.js').FailureStats} stats - The current failure statistics.
 * @returns {Array<{time: string, count: number}>} Array of trend data points.
 */
function generateTrendData(stats) {
  const now = Date.now();
  const points = [];
  const totalMinutes = 10;

  for (let i = totalMinutes - 1; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000).toISOString();

    let count = 0;
    if (stats.totalFailures > 0) {
      if (i === 0) {
        count = stats.failuresLastMinute;
      } else if (i < 5) {
        const avgPerMinute = stats.failuresLastHour > 0
          ? Math.max(Math.round(stats.failuresLastHour / 60), 0)
          : 0;
        count = avgPerMinute;
      }
    }

    points.push({ time, count });
  }

  return points;
}

/**
 * Monitoring Dashboard page component.
 * Displays FailureStatsCard, TrendChart, AlertBanner, and a full ValidationLogPanel.
 * Provides controls to refresh data, clear alerts, and reset all monitoring data.
 * Uses useMonitoring hook for real-time state. Includes explanatory text that this
 * is a simulated monitoring view.
 *
 * User Stories: SCRUM-9785, SCRUM-9791
 *
 * @returns {JSX.Element} The rendered monitoring dashboard page component.
 */
export function MonitoringDashboard() {
  const {
    stats,
    alerts,
    refreshStats,
    dismissAlert,
    clearAllAlerts,
  } = useMonitoring({
    pollInterval: 5000,
    enabled: true,
  });

  const [isResetting, setIsResetting] = useState(false);

  /**
   * Handles refreshing all monitoring data by calling refreshStats from the hook.
   */
  const handleRefresh = useCallback(() => {
    refreshStats();
  }, [refreshStats]);

  /**
   * Handles clearing all alerts via the monitoring hook.
   */
  const handleClearAlerts = useCallback(() => {
    clearAllAlerts();
  }, [clearAllAlerts]);

  /**
   * Handles resetting all monitoring and persistence data.
   * Clears all namespaced localStorage keys and refreshes the monitoring state.
   */
  const handleResetAll = useCallback(() => {
    setIsResetting(true);
    try {
      clearAll();
      clearAllAlerts();
      refreshStats();
    } catch (error) {
      console.error('[MonitoringDashboard] Failed to reset all data:', error);
    } finally {
      setIsResetting(false);
    }
  }, [clearAllAlerts, refreshStats]);

  const trendData = generateTrendData(stats);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Monitoring Dashboard
        </h1>
        <div className="mt-3 rounded-md bg-warning-50 border border-warning-300 p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-warning-500 text-white"
              aria-hidden="true"
            >
              ⚠
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-warning-800">
                Simulated Monitoring View
              </p>
              <p className="mt-1 text-sm text-warning-700">
                This dashboard displays simulated monitoring data based on validation
                activity within the demo application. All statistics, alerts, and trend
                data are generated locally using localStorage — no real backend or
                monitoring infrastructure is involved. Submit forms on Screen A and
                Screen B to generate validation events that appear here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus-ring transition-colors duration-150"
        >
          Refresh Data
        </button>

        <button
          type="button"
          onClick={handleClearAlerts}
          disabled={alerts.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus-ring transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear Alerts
        </button>

        <button
          type="button"
          onClick={handleResetAll}
          disabled={isResetting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-error-700 bg-white border border-error-300 hover:bg-error-50 focus-ring transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isResetting ? 'Resetting…' : 'Reset All Data'}
        </button>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
      )}

      {/* Stats and Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FailureStatsCard stats={stats} />
        <TrendChart trendData={trendData} />
      </div>

      {/* Validation Logs */}
      <div className="border-t border-gray-200 pt-6">
        <ValidationLogPanel />
      </div>
    </div>
  );
}

export default MonitoringDashboard;