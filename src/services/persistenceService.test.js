import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveInput,
  loadInput,
  saveLogs,
  loadLogs,
  saveMonitoring,
  loadMonitoring,
  clearAll,
  clearScreen,
  isLocalStorageAvailable,
} from './persistenceService.js';

describe('persistenceService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is functional', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage throws on setItem', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(isLocalStorageAvailable()).toBe(false);
    });
  });

  describe('saveInput / loadInput', () => {
    it('round-trips form data for screen a', () => {
      const formData = {
        claimId: 'CLM-001',
        memberName: 'John Doe',
        notes: 'Some notes here',
      };

      const saved = saveInput('a', formData);
      expect(saved).toBe(true);

      const loaded = loadInput('a');
      expect(loaded).toEqual(formData);
    });

    it('round-trips form data for screen b', () => {
      const formData = {
        claimId: 'CLM-002',
        providerName: 'Dr. Smith',
      };

      const saved = saveInput('b', formData);
      expect(saved).toBe(true);

      const loaded = loadInput('b');
      expect(loaded).toEqual(formData);
    });

    it('returns null when no data has been saved for a screen', () => {
      const loaded = loadInput('a');
      expect(loaded).toBeNull();
    });

    it('isolates data between screen a and screen b', () => {
      const dataA = { claimId: 'CLM-A', memberName: 'Alice' };
      const dataB = { claimId: 'CLM-B', memberName: 'Bob' };

      saveInput('a', dataA);
      saveInput('b', dataB);

      const loadedA = loadInput('a');
      const loadedB = loadInput('b');

      expect(loadedA).toEqual(dataA);
      expect(loadedB).toEqual(dataB);
      expect(loadedA).not.toEqual(loadedB);
    });

    it('overwrites previously saved data for the same screen', () => {
      const original = { claimId: 'CLM-001' };
      const updated = { claimId: 'CLM-002', memberName: 'Updated' };

      saveInput('a', original);
      saveInput('a', updated);

      const loaded = loadInput('a');
      expect(loaded).toEqual(updated);
    });

    it('handles case-insensitive screen keys', () => {
      const formData = { claimId: 'CLM-UPPER' };

      saveInput('A', formData);
      const loaded = loadInput('a');
      expect(loaded).toEqual(formData);
    });
  });

  describe('saveLogs / loadLogs', () => {
    it('round-trips validation logs', () => {
      const logs = [
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          screenType: 'b',
          message: 'Invalid character found',
        },
        {
          id: 'log-2',
          timestamp: '2024-06-09T12:01:00.000Z',
          field: 'notes',
          invalidChars: [{ char: '\u2019', codePoint: 0x2019, position: 7 }],
          screenType: 'b',
          message: 'Invalid character found',
        },
      ];

      const saved = saveLogs(logs);
      expect(saved).toBe(true);

      const loaded = loadLogs();
      expect(loaded).toEqual(logs);
    });

    it('returns null when no logs have been saved', () => {
      const loaded = loadLogs();
      expect(loaded).toBeNull();
    });

    it('saves an empty array of logs', () => {
      const saved = saveLogs([]);
      expect(saved).toBe(true);

      const loaded = loadLogs();
      expect(loaded).toEqual([]);
    });
  });

  describe('saveMonitoring / loadMonitoring', () => {
    it('round-trips monitoring data', () => {
      const monitoringData = {
        failureRecords: [
          { id: 'rec-1', timestamp: '2024-06-09T12:00:00.000Z', field: 'notes', screenType: 'b' },
        ],
        alerts: [
          { id: 'alert-1', timestamp: '2024-06-09T12:00:00.000Z', condition: 'test', message: 'Test alert', severity: 'warning' },
        ],
      };

      const saved = saveMonitoring(monitoringData);
      expect(saved).toBe(true);

      const loaded = loadMonitoring();
      expect(loaded).toEqual(monitoringData);
    });

    it('returns null when no monitoring data has been saved', () => {
      const loaded = loadMonitoring();
      expect(loaded).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('removes all CLMWR-namespaced keys from localStorage', () => {
      saveInput('a', { claimId: 'CLM-A' });
      saveInput('b', { claimId: 'CLM-B' });
      saveLogs([{ id: 'log-1' }]);
      saveMonitoring({ failureRecords: [], alerts: [] });

      const result = clearAll();
      expect(result).toBe(true);

      expect(loadInput('a')).toBeNull();
      expect(loadInput('b')).toBeNull();
      expect(loadLogs()).toBeNull();
      expect(loadMonitoring()).toBeNull();
    });

    it('does not remove non-namespaced keys from localStorage', () => {
      window.localStorage.setItem('other_app_key', 'some_value');
      saveInput('a', { claimId: 'CLM-A' });

      clearAll();

      expect(window.localStorage.getItem('other_app_key')).toBe('some_value');

      // Clean up
      window.localStorage.removeItem('other_app_key');
    });

    it('returns true even when there are no keys to clear', () => {
      const result = clearAll();
      expect(result).toBe(true);
    });
  });

  describe('clearScreen', () => {
    it('removes data for a specific screen only', () => {
      saveInput('a', { claimId: 'CLM-A' });
      saveInput('b', { claimId: 'CLM-B' });

      const result = clearScreen('a');
      expect(result).toBe(true);

      expect(loadInput('a')).toBeNull();
      expect(loadInput('b')).toEqual({ claimId: 'CLM-B' });
    });
  });

  describe('graceful handling when localStorage is unavailable', () => {
    let setItemSpy;
    let getItemSpy;
    let removeItemSpy;

    beforeEach(() => {
      setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
    });

    it('saveInput returns false when localStorage is unavailable', () => {
      const result = saveInput('a', { claimId: 'CLM-001' });
      expect(result).toBe(false);
    });

    it('loadInput returns null when localStorage is unavailable', () => {
      const result = loadInput('a');
      expect(result).toBeNull();
    });

    it('saveLogs returns false when localStorage is unavailable', () => {
      const result = saveLogs([]);
      expect(result).toBe(false);
    });

    it('loadLogs returns null when localStorage is unavailable', () => {
      const result = loadLogs();
      expect(result).toBeNull();
    });

    it('saveMonitoring returns false when localStorage is unavailable', () => {
      const result = saveMonitoring({});
      expect(result).toBe(false);
    });

    it('loadMonitoring returns null when localStorage is unavailable', () => {
      const result = loadMonitoring();
      expect(result).toBeNull();
    });

    it('clearAll returns false when localStorage is unavailable', () => {
      const result = clearAll();
      expect(result).toBe(false);
    });

    it('clearScreen returns false when localStorage is unavailable', () => {
      const result = clearScreen('a');
      expect(result).toBe(false);
    });
  });

  describe('quota exceeded handling', () => {
    it('saveInput returns false when quota is exceeded', () => {
      // First call to setItem is the availability check — let it pass
      // Second call is the actual write — throw QuotaExceededError
      let callCount = 0;
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
        callCount++;
        if (callCount <= 1) {
          // Allow the availability test write
          return undefined;
        }
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => undefined);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = saveInput('a', { claimId: 'CLM-001' });
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });

    it('saveLogs returns false when quota is exceeded', () => {
      let callCount = 0;
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++;
        if (callCount <= 1) {
          return undefined;
        }
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => undefined);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = saveLogs([{ id: 'log-1' }]);
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('corrupted data handling', () => {
    it('loadInput returns null when stored data is not valid JSON', () => {
      window.localStorage.setItem('clmwr_screen_a_input', 'not-valid-json{{{');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadInput('a');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('loadLogs returns null when stored data is not valid JSON', () => {
      window.localStorage.setItem('clmwr_validation_logs', '%%%invalid%%%');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadLogs();
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });
});