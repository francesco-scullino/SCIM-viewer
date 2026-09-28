import { Drawer } from 'antd';
import { FormEvent } from 'react';

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
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Group name
          <input required value={displayName} onChange={(e) => onChange(e.target.value)} />
        </label>

        <div className="drawer-actions">
          <button type="submit" disabled={isLoading}>
            Create group
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
