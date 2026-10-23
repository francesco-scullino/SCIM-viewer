import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
interface Toast { id: number; type: 'error' | 'success' | 'info'; message: string }
interface ToastContextValue { showError: (message: string) => void; showSuccess: (message: string) => void; showInfo: (message: string) => void }
const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let nextId = 1;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  const push = useCallback((type: Toast['type'], message: string) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, type, message }]);
    timers.current.set(id, setTimeout(() => dismiss(id), type === 'error' ? 8000 : 4000));
  }, [dismiss]);
  const value = useMemo<ToastContextValue>(() => ({ showError: (message) => push('error', message), showSuccess: (message) => push('success', message), showInfo: (message) => push('info', message) }), [push]);
  return <ToastContext.Provider value={value}>{children}<div className="toast-container" aria-label="Notifications">
    {toasts.map((toast) => <div key={toast.id} className={'toast toast-' + toast.type} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="toast-icon" aria-hidden="true">{toast.type === 'error' ? <CloseCircleOutlined /> : toast.type === 'success' ? <CheckCircleOutlined /> : <InfoCircleOutlined />}</span>
      <span className="toast-message">{toast.message}</span><button type="button" className="icon-btn" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}><CloseOutlined /></button>
    </div>)}
  </div></ToastContext.Provider>;
}
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
function describeDetails(details: unknown): string {
  if (details == null) return '';
  if (typeof details === 'string') return details;
  if (typeof details !== 'object') return String(details);
  const record = details as Record<string, unknown>;
  const diagnostic = ['error', 'error_description', 'detail', 'message', 'raw']
    .map((key) => record[key]).filter((value): value is string => typeof value === 'string' && value.length > 0);
  if (diagnostic.length) return [...new Set(diagnostic)].join(' · ');
  try {
    // API error payloads can contain authentication fields; never echo those values.
    return JSON.stringify(details, (key, value: unknown) => /secret|password|token|authorization/i.test(key) ? '[redacted]' : value);
  } catch { return ''; }
}
export function describeError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String(err.message);
    const details = 'details' in err ? describeDetails(err.details) : '';
    return details && details !== message ? message + ': ' + details : message;
  }
  return 'Unknown error';
}
