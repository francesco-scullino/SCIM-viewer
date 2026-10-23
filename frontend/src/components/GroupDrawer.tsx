import { Drawer } from 'antd';
import { FormEvent } from 'react';
import { SubmitButton } from './SubmitButton';

interface GroupDrawerProps {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (displayName: string) => void;
  isLoading?: boolean;
}

export function GroupDrawer({ open, displayName, onClose, onSubmit, onChange, isLoading }: GroupDrawerProps) {
  return (
    <Drawer title="New group" onClose={onClose} open={open} size={420}>
      <p className="hint">Create a group in the selected context. You can add members afterwards.</p>
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Group name
          <input required value={displayName} onChange={(e) => onChange(e.target.value)} />
        </label>

        <div className="drawer-actions">
          <SubmitButton loading={isLoading}>Create group</SubmitButton>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
