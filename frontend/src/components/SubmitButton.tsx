import { LoadingOutlined } from '@ant-design/icons';
import { ButtonHTMLAttributes, ReactNode } from 'react';
interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> { loading?: boolean; children: ReactNode }
export function SubmitButton({ loading, children, disabled, ...rest }: SubmitButtonProps) {
  return <button type="submit" disabled={disabled || loading} aria-busy={loading} {...rest}>{loading && <LoadingOutlined spin aria-hidden="true" />}{children}</button>;
}
