/**
 * Storage Service - Maneja la persistencia de datos en LocalStorage
 * Guarda y restaura sesiones de fotos con captions
 */

import { Photo } from '../types';

const STORAGE_KEY = 'flashbooth_session';
const SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export interface StoredSession {
  photos: Photo[];
  caption: string;
  timestamp: number;
  sessionId: string;
}

/**
 * Guarda la sesión actual en LocalStorage
 */
export const saveSession = (photos: Photo[], caption: string): string => {
  try {
    const sessionId = generateSessionId();
    const session: StoredSession = {
      photos,
      caption,
      timestamp: Date.now(),
      sessionId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return sessionId;
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
    return '';
  }
};

/**
 * Restaura la sesión desde LocalStorage
 */
export const loadSession = (): StoredSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: StoredSession = JSON.parse(stored);
    
    // Verificar si la sesión ha expirado (24 horas)
    if (Date.now() - session.timestamp > SESSION_EXPIRY_TIME) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error loading session from localStorage:', error);
    return null;
  }
};

/**
 * Limpia la sesión actual
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session from localStorage:', error);
  }
};

/**
 * Genera un ID único para la sesión
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Obtiene todas las sesiones guardadas (futuro: para galería)
 */
export const getAllSessions = (): StoredSession[] => {
  try {
    // Nota: Por ahora solo guardamos una sesión activa
    // En el futuro, esto podría iterarar sobre múltiples items
    const session = loadSession();
    return session ? [session] : [];
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return [];
  }
};

/**
 * Verifica si hay datos guardados en LocalStorage
 */
export const hasStoredSession = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Error checking for stored session:', error);
    return false;
  }
};
