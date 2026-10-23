import { Drawer } from 'antd';
import { FormEvent } from 'react';
import { SubmitButton } from './SubmitButton';

interface UserFormState {
  userName: string;
  givenName: string;
  familyName: string;
  email: string;
  active: boolean;
}

interface UserDrawerProps {
  open: boolean;
  form: UserFormState;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (form: UserFormState) => void;
  isLoading?: boolean;
}

export function UserDrawer({ open, form, onClose, onSubmit, onChange, isLoading }: UserDrawerProps) {
  return (
    <Drawer title="New user" onClose={onClose} open={open} size={480}>
      <p className="hint">The user will be created in the selected application and environment.</p>
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Username
          <input required value={form.userName} onChange={(e) => onChange({ ...form, userName: e.target.value })} />
        </label>

        <label>
          First name
          <input value={form.givenName} onChange={(e) => onChange({ ...form, givenName: e.target.value })} />
        </label>

        <label>
          Last name
          <input value={form.familyName} onChange={(e) => onChange({ ...form, familyName: e.target.value })} />
        </label>

        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => onChange({ ...form, active: e.target.checked })}
          />
          Active
        </label>

        <div className="drawer-actions">
          <SubmitButton loading={isLoading}>Create user</SubmitButton>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
