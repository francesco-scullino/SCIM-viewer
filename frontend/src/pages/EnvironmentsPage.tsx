import { FormEvent, useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClusterOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, DataError } from '../components/EmptyState';
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  const load = () => {
    setLoading(true);
    setLoadError('');
    environmentsApi
      .list()
      .then(setEnvironments)
      .catch((err) => { const message = describeError(err); setLoadError(message); showError(message); })
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

  const term = search.trim().toLocaleLowerCase();
  const filteredEnvironments = environments.filter((env) => (env.name + ' ' + env.tokenEndpoint + ' ' + (env.scope ?? '')).toLocaleLowerCase().includes(term));

  return (
    <section aria-label="Environments registry">
      <PageHeader title="Environments" description="Define the identity provider and default scope shared by applications in each environment." action={<IconButton icon={<PlusOutlined />} label="New environment" showLabel onClick={handleOpenDrawer} />} />

      <EnvironmentDrawer
        open={drawerOpen}
        form={form}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        onChange={setForm}
        isLoading={submitting}
      />

      <div className="data-panel" aria-busy={loading}>
        <div className="table-toolbar"><div className="toolbar-search"><Input allowClear className="search-input" prefix={<SearchOutlined />} placeholder="Find an environment" aria-label="Search environments" value={search} onChange={(event) => setSearch(event.target.value)} /><span className="result-count" aria-live="polite">{loading ? 'Loading…' : loadError ? 'Unavailable' : filteredEnvironments.length + ' of ' + environments.length}</span></div></div>
        {loading ? <Loader label="Loading environments…" /> : loadError ? <DataError message={loadError} onRetry={load} /> : filteredEnvironments.length === 0 ? (
          <EmptyState icon={<ClusterOutlined />} title={search ? 'No matching environments' : 'Add your first environment'} description={search ? 'Try a different name or clear the search.' : 'Set up a token endpoint and optional scope before connecting your applications.'} action={search ? <button type="button" className="secondary" onClick={() => setSearch('')}>Clear search</button> : <IconButton icon={<PlusOutlined />} label="New environment" showLabel onClick={handleOpenDrawer} />} />
        ) : <div className="table-scroll" role="region" aria-label="Environments table" tabIndex={0}><table className="data-table">
          <caption className="visually-hidden">Configured identity-provider environments</caption>
          <thead><tr><th scope="col">Environment</th><th scope="col">Token endpoint</th><th scope="col">Default scope</th><th scope="col" className="actions-heading">Actions</th></tr></thead>
          <tbody>{filteredEnvironments.map((env) => <tr key={env.id}>
            <td><div className="identity-cell"><span className="identity-avatar" aria-hidden="true"><ClusterOutlined /></span><span className="identity-name">{env.name}</span></div></td>
            <td className="endpoint">{env.tokenEndpoint}</td><td>{env.scope || '—'}</td>
            <td className="actions"><IconButton icon={<EditOutlined />} label={'Edit environment ' + env.name} onClick={() => handleEdit(env)} /><IconButton icon={<DeleteOutlined />} label={'Delete environment ' + env.name} danger onClick={() => handleDelete(env)} /></td>
          </tr>)}</tbody>
        </table></div>}
        {!loading && !loadError && filteredEnvironments.length > 0 && <div className="table-footer"><span>{filteredEnvironments.length} {filteredEnvironments.length === 1 ? 'environment' : 'environments'} shown</span><span>OAuth2 client-credentials authentication</span></div>}
      </div>
    </section>
  );
}
