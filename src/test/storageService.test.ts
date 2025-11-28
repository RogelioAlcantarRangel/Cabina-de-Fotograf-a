import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveSession,
  loadSession,
  clearSession,
  hasStoredSession,
  generateSessionId,
} from '../../services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    it('should return a string', () => {
      const id = generateSessionId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('saveSession', () => {
    it('should save session with photos and caption', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      const caption = 'Test Caption';

      const sessionId = saveSession(photos, caption);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');

      const stored = localStorage.getItem('booth_session');
      expect(stored).toBeDefined();
      expect(stored).toContain('Test Caption');
    });

    it('should include timestamp in saved session', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      const caption = 'Test';

      saveSession(photos, caption);

      const stored = JSON.parse(localStorage.getItem('booth_session') || '{}');
      expect(stored.timestamp).toBeDefined();
      expect(typeof stored.timestamp).toBe('number');
    });

    it('should overwrite previous session', () => {
      const photos1 = [
        { id: '1', dataUrl: 'data:image/png;base64,test1', timestamp: Date.now() },
      ];
      const photos2 = [
        { id: '2', dataUrl: 'data:image/png;base64,test2', timestamp: Date.now() },
      ];

      saveSession(photos1, 'Caption 1');
      saveSession(photos2, 'Caption 2');

      const stored = JSON.parse(localStorage.getItem('booth_session') || '{}');
      expect(stored.caption).toBe('Caption 2');
      expect(stored.photos.length).toBe(1);
    });
  });

  describe('loadSession', () => {
    it('should return null if no session saved', () => {
      const session = loadSession();
      expect(session).toBeNull();
    });

    it('should load saved session', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      const caption = 'Test Caption';

      saveSession(photos, caption);
      const loaded = loadSession();

      expect(loaded).not.toBeNull();
      expect(loaded?.caption).toBe('Test Caption');
      expect(loaded?.photos.length).toBe(1);
    });

    it('should return null if session expired (>24h)', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      saveSession(photos, 'Test');

      // Simular sesión vieja (más de 24h)
      const stored = JSON.parse(localStorage.getItem('booth_session') || '{}');
      stored.timestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 horas atrás
      localStorage.setItem('booth_session', JSON.stringify(stored));

      const loaded = loadSession();
      expect(loaded).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('booth_session', 'invalid json');
      const session = loadSession();
      expect(session).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should remove session from storage', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      saveSession(photos, 'Test');

      expect(localStorage.getItem('booth_session')).toBeDefined();

      clearSession();

      expect(localStorage.getItem('booth_session')).toBeNull();
    });

    it('should not throw error if no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });

  describe('hasStoredSession', () => {
    it('should return false if no session stored', () => {
      const has = hasStoredSession();
      expect(has).toBe(false);
    });

    it('should return true if session stored and valid', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      saveSession(photos, 'Test');

      const has = hasStoredSession();
      expect(has).toBe(true);
    });

    it('should return false if session expired', () => {
      const photos = [
        { id: '1', dataUrl: 'data:image/png;base64,test', timestamp: Date.now() },
      ];
      saveSession(photos, 'Test');

      // Simular expiración
      const stored = JSON.parse(localStorage.getItem('booth_session') || '{}');
      stored.timestamp = Date.now() - 25 * 60 * 60 * 1000;
      localStorage.setItem('booth_session', JSON.stringify(stored));

      const has = hasStoredSession();
      expect(has).toBe(false);
    });
  });
});
