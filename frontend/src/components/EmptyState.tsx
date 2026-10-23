import { ReactNode } from 'react';

interface Props { icon?: ReactNode; title: string; description: string; action?: ReactNode }
export function EmptyState({ icon, title, description, action }: Props) {
  return <div className="empty-state">{icon && <span className="empty-state-icon" aria-hidden="true">{icon}</span>}<h3>{title}</h3><p>{description}</p>{action && <div className="empty-state-action">{action}</div>}</div>;
}
export function DataError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="data-error" role="alert"><div><strong>Unable to load data</strong><p>{message}</p></div><button type="button" className="secondary" onClick={onRetry}>Try again</button></div>;
}
