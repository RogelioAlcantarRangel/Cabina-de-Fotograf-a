import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Componente que lanza error (solo en render, no en handleClick)
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return React.createElement('div', null, 'Safe content');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(
          'div',
          null,
          'Test content'
        )
      )
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should display error UI when child throws', () => {
    // Suprimir error log esperado
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ErrorThrowingComponent, { shouldThrow: true })
      )
    );

    expect(screen.getByText('¡Algo salió mal!')).toBeInTheDocument();
    expect(screen.getByText(/error inesperado/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should show retry button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ErrorThrowingComponent, { shouldThrow: true })
      )
    );

    const retryButton = screen.getByRole('button', { name: /Reintentar/i });
    expect(retryButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should show reload button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ErrorThrowingComponent, { shouldThrow: true })
      )
    );

    const reloadButton = screen.getByRole('button', { name: /Recargar Página/i });
    expect(reloadButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should show error details in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ErrorThrowingComponent, { shouldThrow: true })
      )
    );

    if (process.env.NODE_ENV === 'development') {
      expect(screen.getByText(/Error Details:/i)).toBeInTheDocument();
    }

    consoleSpy.mockRestore();
  });
});
