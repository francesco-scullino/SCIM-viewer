import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: number;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface ToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: Toast['type'], message: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), type === 'error' ? 8000 : 4000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    showError: (message) => push('error', message),
    showSuccess: (message) => push('success', message),
    showInfo: (message) => push('info', message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function describeError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as any).message);
  }
  return 'Errore sconosciuto';
}
