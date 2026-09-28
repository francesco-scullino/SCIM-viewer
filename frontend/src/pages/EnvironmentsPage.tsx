import { FormEvent, useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { environmentsApi } from '../api/environments';
import { Environment } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';
import { EnvironmentDrawer } from '../components/EnvironmentDrawer';
import { IconButton } from '../components/IconButton';
import { Loader } from '../components/Loader';

interface FormState {
  id: number | null;
  name: string;
  tokenEndpoint: string;
  scope: string;
}

const emptyForm: FormState = { id: null, name: '', tokenEndpoint: '', scope: '' };

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  const load = () => {
    setLoading(true);
    environmentsApi
      .list()
      .then(setEnvironments)
      .catch((err) => showError(describeError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name: form.name, tokenEndpoint: form.tokenEndpoint, scope: form.scope || undefined };
      if (form.id != null) {
        await environmentsApi.update(form.id, payload);
        showSuccess('Environment updated');
      } else {
        await environmentsApi.create(payload);
        showSuccess('Environment created');
      }
      setForm(emptyForm);
      setDrawerOpen(false);
      load();
    } catch (err) {
      showError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (env: Environment) => {
    setForm({ id: env.id, name: env.name, tokenEndpoint: env.tokenEndpoint, scope: env.scope ?? '' });
    setDrawerOpen(true);
  };

  const handleDelete = async (env: Environment) => {
    if (!confirm(`Delete environment "${env.name}"?`)) return;
    try {
      await environmentsApi.remove(env.id);
      showSuccess('Environment deleted');
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleOpenDrawer = () => {
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  return (
    <section>
      <h2>Environments</h2>
      <p className="hint">
        Each environment (e.g. dev, pre, prod) defines the OIDC Token Endpoint used to obtain the
        client-credentials token, shared by all applications configured on that environment.
      </p>

      <div className="section-toolbar">
        <IconButton icon={<PlusOutlined />} label="New environment" onClick={handleOpenDrawer} />
      </div>

      <EnvironmentDrawer
        open={drawerOpen}
        form={form}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        onChange={setForm}
        isLoading={submitting}
      />

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Token Endpoint</th>
              <th>Scope</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {environments.map((env) => (
              <tr key={env.id}>
                <td>{env.name}</td>
                <td>{env.tokenEndpoint}</td>
                <td>{env.scope || '-'}</td>
                <td className="actions">
                  <IconButton icon={<EditOutlined />} label="Edit" onClick={() => handleEdit(env)} />
                  <IconButton icon={<DeleteOutlined />} label="Delete" danger onClick={() => handleDelete(env)} />
                </td>
              </tr>
            ))}
            {environments.length === 0 && (
              <tr>
                <td colSpan={4}>No environments configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
