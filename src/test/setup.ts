import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock del Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: vi.fn() }],
      })
    ),
  },
});

// Suprimir console.error en tests a menos que esté explícitamente esperado
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
