import { Fragment, FormEvent, useEffect, useState } from 'react';
import { applicationsApi } from '../api/applications';
import { environmentsApi } from '../api/environments';
import { Application, AppEnvironmentConfig, Environment } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';

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
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [configs, setConfigs] = useState<AppEnvironmentConfig[]>([]);
  const [configForm, setConfigForm] = useState<ConfigFormState>(emptyConfigForm);
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
      loadApplications();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleAppEdit = (app: Application) => {
    setAppForm({ id: app.id, name: app.name, description: app.description ?? '' });
  };

  const handleAppDelete = async (app: Application) => {
    if (!confirm(`Delete application "${app.name}" and all its configurations?`)) return;
    try {
      await applicationsApi.remove(app.id);
      showSuccess('Application deleted');
      if (expandedAppId === app.id) setExpandedAppId(null);
      loadApplications();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const toggleConfigs = (app: Application) => {
    if (expandedAppId === app.id) {
      setExpandedAppId(null);
      return;
    }
    setExpandedAppId(app.id);
    setConfigForm(emptyConfigForm);
    loadConfigs(app.id);
  };

  const handleConfigSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (expandedAppId == null) return;
    try {
      const payload = {
        environmentId: Number(configForm.environmentId),
        clientId: configForm.clientId,
        clientSecret: configForm.clientSecret,
        scimBaseUrl: configForm.scimBaseUrl,
        scope: configForm.scope || undefined,
      };
      if (configForm.id != null) {
        await applicationsApi.updateConfig(expandedAppId, configForm.id, payload);
        showSuccess('Configuration updated');
      } else {
        await applicationsApi.createConfig(expandedAppId, payload);
        showSuccess('Configuration created');
      }
      setConfigForm(emptyConfigForm);
      loadConfigs(expandedAppId);
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
  };

  const handleConfigDelete = async (config: AppEnvironmentConfig) => {
    if (expandedAppId == null) return;
    if (!confirm('Delete this configuration?')) return;
    try {
      await applicationsApi.removeConfig(expandedAppId, config.id);
      showSuccess('Configuration deleted');
      loadConfigs(expandedAppId);
    } catch (err) {
      showError(describeError(err));
    }
  };

  return (
    <section>
      <h2>Applications</h2>
      <p className="hint">
        For each application you can define, per environment, the client id, client secret and SCIM
        base URL used to authenticate and call its SCIM API.
      </p>

      <form className="card-form" onSubmit={handleAppSubmit}>
        <h3>{appForm.id != null ? 'Edit application' : 'New application'}</h3>
        <label>
          Name
          <input required value={appForm.name} onChange={(e) => setAppForm((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label>
          Description (optional)
          <input
            value={appForm.description}
            onChange={(e) => setAppForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <div className="form-actions">
          <button type="submit">{appForm.id != null ? 'Save changes' : 'Create application'}</button>
          {appForm.id != null && (
            <button type="button" className="secondary" onClick={() => setAppForm(emptyAppForm)}>
              Cancel
            </button>
          )}
        </div>
      </form>

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
            <Fragment key={app.id}>
              <tr>
                <td>{app.name}</td>
                <td>{app.description || '-'}</td>
                <td className="actions">
                  <button onClick={() => toggleConfigs(app)}>
                    {expandedAppId === app.id ? 'Close configurations' : 'Environment configurations'}
                  </button>
                  <button onClick={() => handleAppEdit(app)}>Edit</button>
                  <button className="danger" onClick={() => handleAppDelete(app)}>
                    Delete
                  </button>
                </td>
              </tr>
              {expandedAppId === app.id && (
                <tr key={`${app.id}-configs`}>
                  <td colSpan={3}>
                    <div className="nested-panel">
                      <form className="card-form" onSubmit={handleConfigSubmit}>
                        <h4>{configForm.id != null ? 'Edit configuration' : 'New configuration'}</h4>
                        <label>
                          Environment
                          <select
                            required
                            value={configForm.environmentId}
                            onChange={(e) => setConfigForm((f) => ({ ...f, environmentId: e.target.value }))}
                            disabled={configForm.id != null}
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
                          <input
                            required
                            value={configForm.clientId}
                            onChange={(e) => setConfigForm((f) => ({ ...f, clientId: e.target.value }))}
                          />
                        </label>
                        <label>
                          Client Secret
                          <input
                            required
                            type="password"
                            value={configForm.clientSecret}
                            onChange={(e) => setConfigForm((f) => ({ ...f, clientSecret: e.target.value }))}
                          />
                        </label>
                        <label>
                          SCIM Base URL
                          <input
                            required
                            type="url"
                            value={configForm.scimBaseUrl}
                            onChange={(e) => setConfigForm((f) => ({ ...f, scimBaseUrl: e.target.value }))}
                            placeholder="https://scim.example.com/v2"
                          />
                        </label>
                        <label>
                          Scope (optional, overrides the environment's scope)
                          <input
                            value={configForm.scope}
                            onChange={(e) => setConfigForm((f) => ({ ...f, scope: e.target.value }))}
                          />
                        </label>
                        <div className="form-actions">
                          <button type="submit">{configForm.id != null ? 'Save changes' : 'Add'}</button>
                          {configForm.id != null && (
                            <button type="button" className="secondary" onClick={() => setConfigForm(emptyConfigForm)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Environment</th>
                            <th>Client ID</th>
                            <th>SCIM Base URL</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {configs.map((config) => (
                            <tr key={config.id}>
                              <td>{config.environmentName}</td>
                              <td>{config.clientId}</td>
                              <td>{config.scimBaseUrl}</td>
                              <td className="actions">
                                <button onClick={() => handleConfigEdit(config)}>Edit</button>
                                <button className="danger" onClick={() => handleConfigDelete(config)}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                          {configs.length === 0 && (
                            <tr>
                              <td colSpan={4}>No configuration for this application yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
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
