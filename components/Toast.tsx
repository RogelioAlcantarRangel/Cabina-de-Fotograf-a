import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // ms, 0 = no auto-close
  onClose: (id: string) => void;
}

/**
 * Toast individual component
 * Auto-cierra después de duration o puede ser cerrado manualmente
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      iconColor: 'text-red-500',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      iconColor: 'text-green-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-500',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 
        ${config.bgColor} 
        border ${config.borderColor}
        rounded-lg p-4 backdrop-blur-sm
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`flex-1 text-sm ${config.textColor}`}>{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast Container - Maneja múltiples toasts
 * Posicionado en esquina inferior derecha
 */
interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Hook para usar el sistema de toasts
 * 
 * Uso:
 * const { addToast } = useToast();
 * addToast('Error al capturar foto', 'error');
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (
    message: string,
    type: ToastType = 'info',
    duration: number = 5000
  ): string => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastProps & { id: string } = {
      id,
      message,
      type,
      duration,
      onClose: removeToast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />,
  };
};
