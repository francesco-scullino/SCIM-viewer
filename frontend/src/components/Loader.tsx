import { Spin } from 'antd';

interface LoaderProps {
  label?: string;
}

/** Centered loading spinner used consistently across the app while data is being fetched. */
export function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div className="loader-container">
      <Spin size="large" />
      <span className="loader-label">{label}</span>
    </div>
  );
}
