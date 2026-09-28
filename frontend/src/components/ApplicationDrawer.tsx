import { Drawer } from 'antd';
import { FormEvent } from 'react';

interface AppFormState {
  id: number | null;
  name: string;
  description: string;
}

interface ApplicationDrawerProps {
  open: boolean;
  form: AppFormState;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (form: AppFormState) => void;
  isLoading?: boolean;
}

export function ApplicationDrawer({ open, form, onClose, onSubmit, onChange, isLoading }: ApplicationDrawerProps) {
  return (
    <Drawer title={form.id != null ? 'Edit application' : 'New application'} onClose={onClose} open={open} size={480}>
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Application name"
          />
        </label>

        <label>
          Description (optional)
          <textarea
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            placeholder="Enter description"
            rows={4}
          />
        </label>

        <div className="drawer-actions">
          <button type="submit" disabled={isLoading}>
            {form.id != null ? 'Save changes' : 'Create application'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
