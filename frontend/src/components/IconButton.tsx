import { Tooltip } from 'antd';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: ReactNode;
  label: string;
  danger?: boolean;
}

/**
 * Small round button that shows only an icon, with its label available as a tooltip
 * (hover/focus) and as an accessible name for screen readers.
 */
export function IconButton({ icon, label, danger, className, ...rest }: IconButtonProps) {
  const classes = ['icon-btn', danger ? 'danger' : '', className].filter(Boolean).join(' ');
  return (
    <Tooltip title={label}>
      <button type="button" className={classes} aria-label={label} {...rest}>
        {icon}
      </button>
    </Tooltip>
  );
}
