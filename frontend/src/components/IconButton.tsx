import { Tooltip } from 'antd';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  showLabel?: boolean;
}
export function IconButton({ icon, label, danger, showLabel, className, ...rest }: IconButtonProps) {
  const classes = [showLabel ? 'label-button' : 'icon-btn', danger ? 'danger' : '', className].filter(Boolean).join(' ');
  const button = <button type="button" className={classes} aria-label={label} {...rest}><span aria-hidden="true">{icon}</span>{showLabel && <span>{label}</span>}</button>;
  return showLabel ? button : <Tooltip title={label}>{button}</Tooltip>;
}
