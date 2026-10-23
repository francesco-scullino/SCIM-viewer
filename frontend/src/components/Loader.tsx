interface LoaderProps { label?: string }
export function Loader({ label = 'Loading data…' }: LoaderProps) {
  return <div className="loader-container" role="status" aria-label={label}><div className="table-skeleton" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-row" key={index}><span /><span /><span /></div>)}</div><span className="visually-hidden">{label}</span></div>;
}
