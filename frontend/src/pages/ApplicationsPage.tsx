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
        showSuccess('Applicazione aggiornata');
      } else {
        await applicationsApi.create(payload);
        showSuccess('Applicazione creata');
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
    if (!confirm(`Eliminare l'applicazione "${app.name}" e tutte le sue configurazioni?`)) return;
    try {
      await applicationsApi.remove(app.id);
      showSuccess('Applicazione eliminata');
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
        showSuccess('Configurazione aggiornata');
      } else {
        await applicationsApi.createConfig(expandedAppId, payload);
        showSuccess('Configurazione creata');
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
    if (!confirm('Eliminare questa configurazione?')) return;
    try {
      await applicationsApi.removeConfig(expandedAppId, config.id);
      showSuccess('Configurazione eliminata');
      loadConfigs(expandedAppId);
    } catch (err) {
      showError(describeError(err));
    }
  };

  return (
    <section>
      <h2>Anagrafica Applicazioni</h2>
      <p className="hint">
        Per ogni applicazione puoi definire, per ciascun ambiente, il client id, il client secret e la SCIM
        base URL usati per autenticarsi e chiamare le relative API SCIM.
      </p>

      <form className="card-form" onSubmit={handleAppSubmit}>
        <h3>{appForm.id != null ? 'Modifica applicazione' : 'Nuova applicazione'}</h3>
        <label>
          Nome
          <input required value={appForm.name} onChange={(e) => setAppForm((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label>
          Descrizione (opzionale)
          <input
            value={appForm.description}
            onChange={(e) => setAppForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <div className="form-actions">
          <button type="submit">{appForm.id != null ? 'Salva modifiche' : 'Crea applicazione'}</button>
          {appForm.id != null && (
            <button type="button" className="secondary" onClick={() => setAppForm(emptyAppForm)}>
              Annulla
            </button>
          )}
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrizione</th>
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
                    {expandedAppId === app.id ? 'Chiudi configurazioni' : 'Configurazioni per ambiente'}
                  </button>
                  <button onClick={() => handleAppEdit(app)}>Modifica</button>
                  <button className="danger" onClick={() => handleAppDelete(app)}>
                    Elimina
                  </button>
                </td>
              </tr>
              {expandedAppId === app.id && (
                <tr key={`${app.id}-configs`}>
                  <td colSpan={3}>
                    <div className="nested-panel">
                      <form className="card-form" onSubmit={handleConfigSubmit}>
                        <h4>{configForm.id != null ? 'Modifica configurazione' : 'Nuova configurazione'}</h4>
                        <label>
                          Ambiente
                          <select
                            required
                            value={configForm.environmentId}
                            onChange={(e) => setConfigForm((f) => ({ ...f, environmentId: e.target.value }))}
                            disabled={configForm.id != null}
                          >
                            <option value="">-- seleziona --</option>
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
                          Scope (opzionale, sovrascrive quello dell'ambiente)
                          <input
                            value={configForm.scope}
                            onChange={(e) => setConfigForm((f) => ({ ...f, scope: e.target.value }))}
                          />
                        </label>
                        <div className="form-actions">
                          <button type="submit">{configForm.id != null ? 'Salva modifiche' : 'Aggiungi'}</button>
                          {configForm.id != null && (
                            <button type="button" className="secondary" onClick={() => setConfigForm(emptyConfigForm)}>
                              Annulla
                            </button>
                          )}
                        </div>
                      </form>

                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Ambiente</th>
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
                                <button onClick={() => handleConfigEdit(config)}>Modifica</button>
                                <button className="danger" onClick={() => handleConfigDelete(config)}>
                                  Elimina
                                </button>
                              </td>
                            </tr>
                          ))}
                          {configs.length === 0 && (
                            <tr>
                              <td colSpan={4}>Nessuna configurazione per questa applicazione.</td>
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
              <td colSpan={3}>Nessuna applicazione configurata.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
