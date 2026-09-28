import { FormEvent, useEffect, useState } from 'react';
import { applicationsApi } from '../api/applications';
import { environmentsApi } from '../api/environments';
import { Application, AppEnvironmentConfig, Environment } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';
import { ApplicationDrawer } from '../components/ApplicationDrawer';
import { ApplicationConfigDrawer } from '../components/ApplicationConfigDrawer';
import { ApplicationConfigListDrawer } from '../components/ApplicationConfigListDrawer';

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
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [appForm, setAppForm] = useState<AppFormState>(emptyAppForm);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [configListDrawerOpen, setConfigListDrawerOpen] = useState(false);
  const [configs, setConfigs] = useState<AppEnvironmentConfig[]>([]);
  const [configForm, setConfigForm] = useState<ConfigFormState>(emptyConfigForm);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const { showError, showSuccess } = useToast();

  const loadApplications = () => {
    applicationsApi.list().then(setApplications).catch((err) => showError(describeError(err)));
  };

  useEffect(() => {
    loadApplications();
    environmentsApi.list().then(setEnvironments).catch((err) => showError(describeError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfigs = (applicationId: number) => {
    applicationsApi
      .listConfigs(applicationId)
      .then(setConfigs)
      .catch((err) => showError(describeError(err)));
  };

  const handleAppSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
        setSelectedAppId(null);
        setConfigListDrawerOpen(false);
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
    setSelectedAppId(app.id);
    setConfigListDrawerOpen(true);
    loadConfigs(app.id);
  };

  const closeConfigList = () => {
    setConfigListDrawerOpen(false);
    setSelectedAppId(null);
  };

  const handleConfigSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedAppId == null) return;
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

  return (
    <section>
      <h2>Applications</h2>
      <p className="hint">
        For each application you can define, per environment, the client id, client secret and SCIM
        base URL used to authenticate and call its SCIM API.
      </p>

      <div className="section-toolbar">
        <button onClick={handleOpenAppDrawer}>+ New application</button>
      </div>

      <ApplicationDrawer
        open={appDrawerOpen}
        form={appForm}
        onClose={handleCloseAppDrawer}
        onSubmit={handleAppSubmit}
        onChange={setAppForm}
      />

      <ApplicationConfigListDrawer
        open={configListDrawerOpen}
        application={selectedApp}
        configs={configs}
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
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{app.description || '-'}</td>
              <td className="actions">
                <button onClick={() => openConfigList(app)}>Configurations</button>
                <button onClick={() => handleAppEdit(app)}>Edit</button>
                <button className="danger" onClick={() => handleAppDelete(app)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan={3}>No applications configured.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
