import { useState, useCallback } from 'react';

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastItem = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration + 300); // Add 300ms for exit animation
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, { type: 'success', duration });
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, { type: 'error', duration });
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, { type: 'warning', duration });
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, { type: 'info', duration });
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};