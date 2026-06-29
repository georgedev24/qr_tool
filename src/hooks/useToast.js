import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type, duration) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, removing: false }]);

    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === id ? { ...t, removing: true } : t)
      );
    }, duration - 300);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => t.id === id ? { ...t, removing: true } : t)
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toast = {
    success: (message, duration = 2800) => addToast(message, 'success', duration),
    error: (message, duration = 3500) => addToast(message, 'error', duration),
    info: (message, duration = 2800) => addToast(message, 'info', duration),
    removeToast,
  };

  return { toasts, toast };
}
