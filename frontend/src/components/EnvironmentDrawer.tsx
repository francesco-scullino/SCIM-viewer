import { Drawer } from 'antd';
import { FormEvent } from 'react';

interface EnvironmentFormState {
  id: number | null;
  name: string;
  tokenEndpoint: string;
  scope: string;
}

interface EnvironmentDrawerProps {
  open: boolean;
  form: EnvironmentFormState;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (form: EnvironmentFormState) => void;
  isLoading?: boolean;
}

export function EnvironmentDrawer({ open, form, onClose, onSubmit, onChange, isLoading }: EnvironmentDrawerProps) {
  return (
    <Drawer title={form.id != null ? 'Edit environment' : 'New environment'} onClose={onClose} open={open} size={560}>
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="dev / pre / prod"
          />
        </label>

        <label>
          Token Endpoint
          <input
            required
            type="url"
            value={form.tokenEndpoint}
            onChange={(e) => onChange({ ...form, tokenEndpoint: e.target.value })}
            placeholder="https://idp.example.com/oauth2/token"
          />
        </label>

        <label>
          Default scope (optional)
          <input value={form.scope} onChange={(e) => onChange({ ...form, scope: e.target.value })} />
        </label>

        <div className="drawer-actions">
          <button type="submit" disabled={isLoading}>
            {form.id != null ? 'Save changes' : 'Create environment'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
