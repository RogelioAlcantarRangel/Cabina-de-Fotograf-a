import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastContainer, useToast } from '../../components/Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Toast', () => {
    it('should render toast with message', () => {
      const mockOnClose = vi.fn();
      render(
        React.createElement(Toast, {
          id: 'test-1',
          message: 'Test message',
          type: 'info',
          onClose: mockOnClose,
          duration: 0,
        })
      );

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render close button', async () => {
      const mockOnClose = vi.fn();
      const user = userEvent.setup();

      render(
        React.createElement(Toast, {
          id: 'test-1',
          message: 'Test message',
          type: 'info',
          onClose: mockOnClose,
          duration: 0,
        })
      );

      const closeButton = screen.getByRole('button');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });

    it('should auto-close after duration', async () => {
      const mockOnClose = vi.fn();

      render(
        React.createElement(Toast, {
          id: 'test-1',
          message: 'Test message',
          type: 'error',
          onClose: mockOnClose,
          duration: 100,
        })
      );

      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalledWith('test-1');
        },
        { timeout: 500 }
      );
    });

    it('should not auto-close if duration is 0', async () => {
      const mockOnClose = vi.fn();

      render(
        React.createElement(Toast, {
          id: 'test-1',
          message: 'Test message',
          type: 'warning',
          onClose: mockOnClose,
          duration: 0,
        })
      );

      // Esperar un bit pero no debería cerrar
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('useToast Hook', () => {
    it('should add toast', () => {
      const TestComponent = () => {
        const { addToast, ToastContainer: Container } = useToast();

        React.useEffect(() => {
          addToast('Test message', 'success');
        }, [addToast]);

        return React.createElement('div', null, React.createElement(Container));
      };

      render(React.createElement(TestComponent));
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should remove toast', async () => {
      const TestComponent = () => {
        const { addToast, removeToast, toasts, ToastContainer: Container } =
          useToast();

        return React.createElement('div', null,
          React.createElement('button', {
            onClick: () => {
              const id = addToast('Test', 'info', 0);
              removeToast(id);
            },
          }, 'Add then Remove'),
          React.createElement(Container)
        );
      };

      const user = userEvent.setup();
      render(React.createElement(TestComponent));

      const button = screen.getByRole('button', { name: /Add then Remove/i });
      await user.click(button);

      // Toast debería no existir después de removerse
      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      });
    });

    it('should render different toast types', () => {
      const TestComponent = () => {
        const { addToast, ToastContainer: Container } = useToast();

        React.useEffect(() => {
          addToast('Error', 'error', 0);
          addToast('Success', 'success', 0);
          addToast('Info', 'info', 0);
          addToast('Warning', 'warning', 0);
        }, [addToast]);

        return React.createElement('div', null, React.createElement(Container));
      };

      render(React.createElement(TestComponent));

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });
});
