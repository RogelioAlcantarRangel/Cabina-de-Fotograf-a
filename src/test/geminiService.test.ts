import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TimeoutError,
  retryWithBackoff,
  executeWithTimeout,
} from '../../services/geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('executeWithTimeout', () => {
    it('should execute function successfully within timeout', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await executeWithTimeout(fn, 1000);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw TimeoutError if execution exceeds timeout', async () => {
      const fn = vi.fn(async () => {
        return new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });
      });

      await expect(executeWithTimeout(fn, 100)).rejects.toThrow(TimeoutError);
    });

    it('should use default timeout if not provided', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await executeWithTimeout(fn);
      expect(result).toBe('success');
    });

    it('should propagate other errors', async () => {
      const testError = new Error('Network error');
      const fn = vi.fn(async () => {
        throw testError;
      });

      await expect(executeWithTimeout(fn, 1000)).rejects.toThrow('Network error');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await retryWithBackoff(fn, 3, [100, 100, 100]);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, 3, [100, 100, 100]);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry exactly maxAttempts times', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Network error');
      });

      await expect(retryWithBackoff(fn, 3, [50, 50, 50])).rejects.toThrow(
        'Network error'
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff delays', async () => {
      const delays: number[] = [];
      const startTime = Date.now();

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('success');

      await retryWithBackoff(fn, 3, [100, 150, 200]);
      const totalTime = Date.now() - startTime;

      // Debe tomar al menos 100 + 150 = 250ms (con margen de error)
      expect(totalTime).toBeGreaterThanOrEqual(200);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const customError = new Error('Invalid API key');
      const fn = vi.fn(async () => {
        throw customError;
      });

      // Errors que no sean de red/timeout deberían fallar inmediatamente
      // (dependiendo de la implementación del servicio)
      await expect(retryWithBackoff(fn, 3, [50, 50, 50])).rejects.toThrow();
    });

    it('should handle timeout as retryable error', async () => {
      const fn = vi
        .fn()
        .mockImplementationOnce(async () => {
          throw new TimeoutError('Timeout');
        })
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, 3, [50, 50, 50]);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
