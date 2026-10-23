import { Drawer } from 'antd';
import { FormEvent } from 'react';
import { Environment } from '../api/types';
import { SubmitButton } from './SubmitButton';

interface ConfigFormState {
  id: number | null;
  environmentId: string;
  clientId: string;
  clientSecret: string;
  scimBaseUrl: string;
  scope: string;
}

interface ApplicationConfigDrawerProps {
  open: boolean;
  form: ConfigFormState;
  environments: Environment[];
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChange: (form: ConfigFormState) => void;
  isLoading?: boolean;
}

export function ApplicationConfigDrawer({
  open,
  form,
  environments,
  onClose,
  onSubmit,
  onChange,
  isLoading,
}: ApplicationConfigDrawerProps) {
  return (
    <Drawer title={form.id != null ? 'Edit configuration' : 'New configuration'} onClose={onClose} open={open} size={640}>
      <p className="hint">Set the credentials and SCIM endpoint for this application and environment.</p>
      <form className="drawer-form" onSubmit={onSubmit}>
        <label>
          Environment
          <select
            required
            value={form.environmentId}
            onChange={(e) => onChange({ ...form, environmentId: e.target.value })}
            disabled={form.id != null}
          >
            <option value="">-- select --</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Client ID
          <input required value={form.clientId} onChange={(e) => onChange({ ...form, clientId: e.target.value })} />
        </label>

        <label>
          Client Secret
          <input
            required
            type="password"
            value={form.clientSecret}
            onChange={(e) => onChange({ ...form, clientSecret: e.target.value })}
          />
        </label>

        <label>
          SCIM Base URL
          <input
            required
            type="url"
            value={form.scimBaseUrl}
            onChange={(e) => onChange({ ...form, scimBaseUrl: e.target.value })}
            placeholder="https://scim.example.com/v2"
          />
        </label>

        <label>
          Scope (optional, overrides the environment's scope)
          <input value={form.scope} onChange={(e) => onChange({ ...form, scope: e.target.value })} />
        </label>

        <div className="drawer-actions">
          <SubmitButton loading={isLoading}>{form.id != null ? 'Save changes' : 'Add'}</SubmitButton>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
