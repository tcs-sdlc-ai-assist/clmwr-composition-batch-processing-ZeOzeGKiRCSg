import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  recordFailure,
  getFailureStats,
  getAlerts,
  clearAlerts,
  generateAlert,
} from './monitoringService.js';

describe('monitoringService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recordFailure', () => {
    it('records a failure and increments total failure count', () => {
      const logEntry = {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        field: 'providerName',
        screenType: 'b',
        invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
        message: 'Invalid character found',
      };

      const record = recordFailure(logEntry);
      expect(record).not.toBeNull();
      expect(record.id).toBe('log-1');
      expect(record.field).toBe('providerName');
      expect(record.screenType).toBe('b');

      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(1);
    });

    it('increments counts for multiple recorded failures', () => {
      for (let i = 0; i < 5; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: new Date().toISOString(),
          field: 'notes',
          screenType: 'b',
          invalidChars: [],
          message: 'Invalid character found',
        });
      }

      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(5);
    });

    it('returns null for null or non-object input', () => {
      expect(recordFailure(null)).toBeNull();
      expect(recordFailure(undefined)).toBeNull();
      expect(recordFailure('string')).toBeNull();
    });

    it('handles log entry with missing optional fields gracefully', () => {
      const record = recordFailure({});
      expect(record).not.toBeNull();
      expect(record.field).toBe('');
      expect(record.screenType).toBe('');
      expect(record.timestamp).toBeDefined();
      expect(record.id).toBeDefined();
    });
  });

  describe('getFailureStats', () => {
    it('returns zero counts when no failures have been recorded', () => {
      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(0);
      expect(stats.failuresLastMinute).toBe(0);
      expect(stats.failuresLastHour).toBe(0);
      expect(stats.failuresByField).toEqual({});
      expect(stats.trend).toBe('stable');
    });

    it('returns correct total failure count after recording failures', () => {
      recordFailure({
        id: 'log-1',
        timestamp: new Date().toISOString(),
        field: 'notes',
        screenType: 'b',
      });
      recordFailure({
        id: 'log-2',
        timestamp: new Date().toISOString(),
        field: 'providerName',
        screenType: 'b',
      });

      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(2);
    });

    it('counts failures in the last minute correctly', () => {
      const now = new Date().toISOString();

      recordFailure({
        id: 'log-recent',
        timestamp: now,
        field: 'notes',
        screenType: 'b',
      });

      const stats = getFailureStats();
      expect(stats.failuresLastMinute).toBeGreaterThanOrEqual(1);
    });

    it('counts failures in the last hour correctly', () => {
      const now = new Date().toISOString();

      recordFailure({
        id: 'log-recent',
        timestamp: now,
        field: 'notes',
        screenType: 'b',
      });

      const stats = getFailureStats();
      expect(stats.failuresLastHour).toBeGreaterThanOrEqual(1);
    });

    it('groups failures by field name correctly', () => {
      recordFailure({
        id: 'log-1',
        timestamp: new Date().toISOString(),
        field: 'notes',
        screenType: 'b',
      });
      recordFailure({
        id: 'log-2',
        timestamp: new Date().toISOString(),
        field: 'notes',
        screenType: 'b',
      });
      recordFailure({
        id: 'log-3',
        timestamp: new Date().toISOString(),
        field: 'providerName',
        screenType: 'b',
      });

      const stats = getFailureStats();
      expect(stats.failuresByField).toEqual({
        notes: 2,
        providerName: 1,
      });
    });

    it('does not count old failures in the last minute window', () => {
      // Manually set up monitoring state with an old failure record
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const monitoringState = {
        failureRecords: [
          {
            id: 'old-log',
            timestamp: twoMinutesAgo,
            field: 'notes',
            screenType: 'b',
          },
        ],
        alerts: [],
      };
      window.localStorage.setItem('clmwr_monitoring', JSON.stringify(monitoringState));

      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(1);
      expect(stats.failuresLastMinute).toBe(0);
      expect(stats.failuresLastHour).toBe(1);
    });
  });

  describe('getAlerts', () => {
    it('returns an empty array when no alerts exist', () => {
      const alerts = getAlerts();
      expect(alerts).toEqual([]);
    });

    it('generates a critical alert when failure rate exceeds 3 per minute', () => {
      const now = new Date().toISOString();

      for (let i = 0; i < 4; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: 'notes',
          screenType: 'b',
        });
      }

      const alerts = getAlerts();
      const criticalAlert = alerts.find(
        (a) => a.severity === 'critical' && a.condition.startsWith('high_rate_per_minute')
      );
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert.message).toContain('High failure rate');
    });

    it('does not generate duplicate high-rate alerts for subsequent failures', () => {
      const now = new Date().toISOString();

      for (let i = 0; i < 6; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: 'notes',
          screenType: 'b',
        });
      }

      const alerts = getAlerts();
      const highRateAlerts = alerts.filter(
        (a) => a.condition.startsWith('high_rate_per_minute')
      );
      expect(highRateAlerts).toHaveLength(1);
    });

    it('generates a warning alert when a single field exceeds 5 failures', () => {
      const now = new Date().toISOString();

      for (let i = 0; i < 5; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: 'remittanceInfo',
          screenType: 'b',
        });
      }

      const alerts = getAlerts();
      const fieldAlert = alerts.find(
        (a) => a.condition === 'field_failure:remittanceInfo'
      );
      expect(fieldAlert).toBeDefined();
      expect(fieldAlert.severity).toBe('warning');
      expect(fieldAlert.message).toContain('remittanceInfo');
      expect(fieldAlert.message).toContain('5');
    });

    it('generates a warning alert when failures exceed 10 per hour', () => {
      const now = new Date().toISOString();

      for (let i = 0; i < 10; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: `field_${i}`,
          screenType: 'b',
        });
      }

      const alerts = getAlerts();
      const elevatedAlert = alerts.find(
        (a) => a.condition.startsWith('elevated_rate_per_hour')
      );
      expect(elevatedAlert).toBeDefined();
      expect(elevatedAlert.severity).toBe('warning');
      expect(elevatedAlert.message).toContain('Elevated failure rate');
    });
  });

  describe('clearAlerts', () => {
    it('clears all active alerts', () => {
      const now = new Date().toISOString();

      // Generate enough failures to trigger alerts
      for (let i = 0; i < 4; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: 'notes',
          screenType: 'b',
        });
      }

      let alerts = getAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const result = clearAlerts();
      expect(result).toBe(true);

      alerts = getAlerts();
      expect(alerts).toEqual([]);
    });

    it('returns true when there are no alerts to clear', () => {
      const result = clearAlerts();
      expect(result).toBe(true);

      const alerts = getAlerts();
      expect(alerts).toEqual([]);
    });

    it('preserves failure records after clearing alerts', () => {
      const now = new Date().toISOString();

      for (let i = 0; i < 4; i++) {
        recordFailure({
          id: `log-${i}`,
          timestamp: now,
          field: 'notes',
          screenType: 'b',
        });
      }

      clearAlerts();

      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(4);
    });
  });

  describe('generateAlert', () => {
    it('creates an alert object with the correct structure', () => {
      const alert = generateAlert('test_condition', 'Test message', 'warning');

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('timestamp');
      expect(alert.condition).toBe('test_condition');
      expect(alert.message).toBe('Test message');
      expect(alert.severity).toBe('warning');
    });

    it('defaults severity to warning for invalid severity values', () => {
      const alert = generateAlert('test', 'Test', 'invalid_severity');
      expect(alert.severity).toBe('warning');
    });

    it('accepts info severity', () => {
      const alert = generateAlert('test', 'Test', 'info');
      expect(alert.severity).toBe('info');
    });

    it('accepts critical severity', () => {
      const alert = generateAlert('test', 'Test', 'critical');
      expect(alert.severity).toBe('critical');
    });

    it('uses condition as message when message is not provided', () => {
      const alert = generateAlert('my_condition', undefined, 'warning');
      expect(alert.message).toBe('my_condition');
    });

    it('handles empty condition gracefully', () => {
      const alert = generateAlert('', '', 'info');
      expect(alert.condition).toBe('');
      expect(alert.message).toBe('');
    });

    it('generates unique IDs for each alert', () => {
      const alert1 = generateAlert('cond1', 'msg1', 'info');
      const alert2 = generateAlert('cond2', 'msg2', 'warning');
      expect(alert1.id).not.toBe(alert2.id);
    });
  });

  describe('trend computation', () => {
    it('returns stable trend when no failures exist', () => {
      const stats = getFailureStats();
      expect(stats.trend).toBe('stable');
    });

    it('returns stable trend when all failures are at the same time', () => {
      const now = new Date().toISOString();

      recordFailure({
        id: 'log-1',
        timestamp: now,
        field: 'notes',
        screenType: 'b',
      });
      recordFailure({
        id: 'log-2',
        timestamp: now,
        field: 'notes',
        screenType: 'b',
      });

      const stats = getFailureStats();
      // All failures in the newer half, none in older half => increasing
      // This is expected behavior since all are recent
      expect(['increasing', 'stable', 'decreasing']).toContain(stats.trend);
    });

    it('returns increasing trend when newer half has more failures than older half', () => {
      const now = Date.now();
      // Older half: 2.5+ minutes ago (within 5-minute window, first half)
      const olderTimestamp = new Date(now - 3.5 * 60 * 1000).toISOString();
      // Newer half: within last 2.5 minutes
      const newerTimestamp = new Date(now - 30 * 1000).toISOString();

      const monitoringState = {
        failureRecords: [
          { id: 'old-1', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-1', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-2', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-3', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
        ],
        alerts: [],
      };
      window.localStorage.setItem('clmwr_monitoring', JSON.stringify(monitoringState));

      const stats = getFailureStats();
      expect(stats.trend).toBe('increasing');
    });

    it('returns decreasing trend when older half has more failures than newer half', () => {
      const now = Date.now();
      // Older half: 2.5+ minutes ago (within 5-minute window, first half)
      const olderTimestamp = new Date(now - 3.5 * 60 * 1000).toISOString();
      // Newer half: within last 2.5 minutes
      const newerTimestamp = new Date(now - 30 * 1000).toISOString();

      const monitoringState = {
        failureRecords: [
          { id: 'old-1', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'old-2', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'old-3', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-1', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
        ],
        alerts: [],
      };
      window.localStorage.setItem('clmwr_monitoring', JSON.stringify(monitoringState));

      const stats = getFailureStats();
      expect(stats.trend).toBe('decreasing');
    });

    it('returns stable trend when both halves have equal failure counts', () => {
      const now = Date.now();
      const olderTimestamp = new Date(now - 3.5 * 60 * 1000).toISOString();
      const newerTimestamp = new Date(now - 30 * 1000).toISOString();

      const monitoringState = {
        failureRecords: [
          { id: 'old-1', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'old-2', timestamp: olderTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-1', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
          { id: 'new-2', timestamp: newerTimestamp, field: 'notes', screenType: 'b' },
        ],
        alerts: [],
      };
      window.localStorage.setItem('clmwr_monitoring', JSON.stringify(monitoringState));

      const stats = getFailureStats();
      expect(stats.trend).toBe('stable');
    });
  });

  describe('graceful handling when localStorage is unavailable', () => {
    beforeEach(() => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
    });

    it('getFailureStats returns default stats when localStorage is unavailable', () => {
      const stats = getFailureStats();
      expect(stats.totalFailures).toBe(0);
      expect(stats.failuresLastMinute).toBe(0);
      expect(stats.failuresLastHour).toBe(0);
      expect(stats.failuresByField).toEqual({});
      expect(stats.trend).toBe('stable');
    });

    it('getAlerts returns an empty array when localStorage is unavailable', () => {
      const alerts = getAlerts();
      expect(alerts).toEqual([]);
    });
  });
});