import { FormEvent, useEffect, useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, DataError } from '../components/EmptyState';
import { applicationsApi } from '../api/applications';
import { environmentsApi } from '../api/environments';
import { Application, AppEnvironmentConfig, Environment } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';
import { ApplicationDrawer } from '../components/ApplicationDrawer';
import { ApplicationConfigDrawer } from '../components/ApplicationConfigDrawer';
import { ApplicationConfigListDrawer } from '../components/ApplicationConfigListDrawer';
import { IconButton } from '../components/IconButton';
import { Loader } from '../components/Loader';

interface AppFormState {
  id: number | null;
  name: string;
  description: string;
}

const emptyAppForm: AppFormState = { id: null, name: '', description: '' };

interface ConfigFormState {
  id: number | null;
  environmentId: string;
  clientId: string;
  clientSecret: string;
  scimBaseUrl: string;
  scope: string;
}

const emptyConfigForm: ConfigFormState = {
  id: null,
  environmentId: '',
  clientId: '',
  clientSecret: '',
  scimBaseUrl: '',
  scope: '',
};

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [appForm, setAppForm] = useState<AppFormState>(emptyAppForm);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [configListDrawerOpen, setConfigListDrawerOpen] = useState(false);
  const [configs, setConfigs] = useState<AppEnvironmentConfig[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [configsError, setConfigsError] = useState('');
  const configsRequestId = useRef(0);
  const activeConfigAppId = useRef<number | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(emptyConfigForm);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const { showError, showSuccess } = useToast();

  const loadApplications = () => {
    setApplicationsLoading(true);
    setLoadError('');
    applicationsApi
      .list()
      .then(setApplications)
      .catch((err) => { const message = describeError(err); setLoadError(message); showError(message); })
      .finally(() => setApplicationsLoading(false));
  };

  useEffect(() => {
    loadApplications();
    environmentsApi.list().then(setEnvironments).catch((err) => showError(describeError(err)));
    return () => { configsRequestId.current += 1; activeConfigAppId.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfigs = (applicationId: number) => {
    if (activeConfigAppId.current !== applicationId) return;
    const request = ++configsRequestId.current;
    setConfigsLoading(true);
    setConfigsError('');
    applicationsApi.listConfigs(applicationId)
      .then((result) => { if (request === configsRequestId.current && activeConfigAppId.current === applicationId) setConfigs(result); })
      .catch((err) => {
        if (request !== configsRequestId.current || activeConfigAppId.current !== applicationId) return;
        const message = describeError(err);
        setConfigsError(message);
        showError(message);
      })
      .finally(() => { if (request === configsRequestId.current && activeConfigAppId.current === applicationId) setConfigsLoading(false); });
  };

  const handleAppSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAppSubmitting(true);
    try {
      const payload = { name: appForm.name, description: appForm.description || undefined };
      if (appForm.id != null) {
        await applicationsApi.update(appForm.id, payload);
        showSuccess('Application updated');
      } else {
        await applicationsApi.create(payload);
        showSuccess('Application created');
      }
      setAppForm(emptyAppForm);
      setAppDrawerOpen(false);
      loadApplications();
    } catch (err) {
      showError(describeError(err));
    } finally {
      setAppSubmitting(false);
    }
  };

  const handleAppEdit = (app: Application) => {
    setAppForm({ id: app.id, name: app.name, description: app.description ?? '' });
    setAppDrawerOpen(true);
  };

  const handleAppDelete = async (app: Application) => {
    if (!confirm(`Delete application "${app.name}" and all its configurations?`)) return;
    try {
      await applicationsApi.remove(app.id);
      showSuccess('Application deleted');
      if (selectedAppId === app.id) {
        closeConfigList();
      }
      loadApplications();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleOpenAppDrawer = () => {
    setAppForm(emptyAppForm);
    setAppDrawerOpen(true);
  };

  const handleCloseAppDrawer = () => {
    setAppForm(emptyAppForm);
    setAppDrawerOpen(false);
  };

  const openConfigList = (app: Application) => {
    activeConfigAppId.current = app.id;
    setConfigs([]);
    setSelectedAppId(app.id);
    setConfigListDrawerOpen(true);
    loadConfigs(app.id);
  };

  const closeConfigList = () => {
    configsRequestId.current += 1;
    activeConfigAppId.current = null;
    setConfigListDrawerOpen(false);
    setConfigDrawerOpen(false);
    setSelectedAppId(null);
    setConfigs([]);
    setConfigsLoading(false);
    setConfigsError('');
  };

  const handleConfigSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedAppId == null) return;
    setConfigSubmitting(true);
    try {
      const payload = {
        environmentId: Number(configForm.environmentId),
        clientId: configForm.clientId,
        clientSecret: configForm.clientSecret,
        scimBaseUrl: configForm.scimBaseUrl,
        scope: configForm.scope || undefined,
      };
      if (configForm.id != null) {
        await applicationsApi.updateConfig(selectedAppId, configForm.id, payload);
        showSuccess('Configuration updated');
      } else {
        await applicationsApi.createConfig(selectedAppId, payload);
        showSuccess('Configuration created');
      }
      setConfigForm(emptyConfigForm);
      setConfigDrawerOpen(false);
      loadConfigs(selectedAppId);
    } catch (err) {
      showError(describeError(err));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleConfigEdit = (config: AppEnvironmentConfig) => {
    setConfigForm({
      id: config.id,
      environmentId: String(config.environmentId),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      scimBaseUrl: config.scimBaseUrl,
      scope: config.scope ?? '',
    });
    setConfigDrawerOpen(true);
  };

  const handleConfigDelete = async (config: AppEnvironmentConfig) => {
    if (selectedAppId == null) return;
    if (!confirm('Delete this configuration?')) return;
    try {
      await applicationsApi.removeConfig(selectedAppId, config.id);
      showSuccess('Configuration deleted');
      loadConfigs(selectedAppId);
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleOpenConfigDrawer = () => {
    setConfigForm(emptyConfigForm);
    setConfigDrawerOpen(true);
  };

  const handleCloseConfigDrawer = () => {
    setConfigForm(emptyConfigForm);
    setConfigDrawerOpen(false);
  };

  const selectedApp = applications.find((a) => a.id === selectedAppId) ?? null;

  const term = search.trim().toLocaleLowerCase();
  const filteredApplications = applications.filter((app) => (app.name + ' ' + (app.description ?? '')).toLocaleLowerCase().includes(term));

  return (
    <section aria-label="Applications registry">
      <PageHeader title="Applications" description="Register your applications and configure their SCIM connection for each environment." action={<IconButton icon={<PlusOutlined />} label="New application" showLabel onClick={handleOpenAppDrawer} />} />

      <ApplicationDrawer
        open={appDrawerOpen}
        form={appForm}
        onClose={handleCloseAppDrawer}
        onSubmit={handleAppSubmit}
        onChange={setAppForm}
        isLoading={appSubmitting}
      />

      <ApplicationConfigListDrawer
        open={configListDrawerOpen}
        application={selectedApp}
        configs={configs}
        loading={configsLoading}
        error={configsError}
        onRetry={() => { if (selectedAppId != null) loadConfigs(selectedAppId); }}
        onClose={closeConfigList}
        onAddNew={handleOpenConfigDrawer}
        onEdit={handleConfigEdit}
        onDelete={handleConfigDelete}
      />

      <ApplicationConfigDrawer
        open={configDrawerOpen}
        form={configForm}
        environments={environments}
        onClose={handleCloseConfigDrawer}
        onSubmit={handleConfigSubmit}
        onChange={setConfigForm}
        isLoading={configSubmitting}
      />

      <div className="data-panel" aria-busy={applicationsLoading}>
        <div className="table-toolbar"><div className="toolbar-search"><Input allowClear className="search-input" prefix={<SearchOutlined />} placeholder="Find an application" aria-label="Search applications" value={search} onChange={(e) => setSearch(e.target.value)} /><span className="result-count" aria-live="polite">{applicationsLoading ? 'Loading…' : loadError ? 'Unavailable' : filteredApplications.length + ' of ' + applications.length}</span></div></div>
        {applicationsLoading ? <Loader label="Loading applications…" /> : loadError ? <DataError message={loadError} onRetry={loadApplications} /> : filteredApplications.length === 0 ? (
          <EmptyState icon={<AppstoreOutlined />} title={search ? 'No matching applications' : 'Add your first application'} description={search ? 'Try a different name or clear the search.' : 'Register an application, then configure its credentials and SCIM URL for each environment.'} action={search ? <button type="button" className="secondary" onClick={() => setSearch('')}>Clear search</button> : <IconButton icon={<PlusOutlined />} label="New application" showLabel onClick={handleOpenAppDrawer} />} />
        ) : <div className="table-scroll" role="region" aria-label="Applications table" tabIndex={0}><table className="data-table applications-table">
          <caption className="visually-hidden">Registered applications</caption>
          <thead><tr><th scope="col">Application</th><th scope="col">Description</th><th scope="col" className="actions-heading">Actions</th></tr></thead>
          <tbody>{filteredApplications.map((app) => <tr key={app.id}>
            <td><div className="identity-cell"><span className="identity-avatar" aria-hidden="true"><AppstoreOutlined /></span><span className="identity-name">{app.name}</span></div></td>
            <td>{app.description || '—'}</td>
            <td className="actions"><IconButton icon={<SettingOutlined />} label="Configurations" showLabel className="secondary" onClick={() => openConfigList(app)} /><IconButton icon={<EditOutlined />} label={'Edit application ' + app.name} onClick={() => handleAppEdit(app)} /><IconButton icon={<DeleteOutlined />} label={'Delete application ' + app.name} danger onClick={() => handleAppDelete(app)} /></td>
          </tr>)}</tbody>
        </table></div>}
        {!applicationsLoading && !loadError && filteredApplications.length > 0 && <div className="table-footer"><span>{filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} shown</span><span>Credentials are configured per environment</span></div>}
      </div>
    </section>
  );
}
