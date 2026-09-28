import { Spin } from 'antd';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  loading?: boolean;
  children: ReactNode;
}

/** Primary form submit button that shows a small spinner while the action is in flight. */
export function SubmitButton({ loading, children, disabled, ...rest }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={disabled || loading} {...rest}>
      {loading && <Spin size="small" style={{ marginRight: 6, color: '#fff' }} />}
      {children}
    </button>
  );
}
