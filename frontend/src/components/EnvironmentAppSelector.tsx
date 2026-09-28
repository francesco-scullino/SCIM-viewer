import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { environmentsApi } from '../api/environments';
import { applicationsApi } from '../api/applications';
import { Environment, Application } from '../api/types';
import { useSelection } from './SelectionContext';
import { useToast, describeError } from './ToastContext';

export function EnvironmentAppSelector() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const { environmentId, applicationId, setEnvironmentId, setApplicationId } = useSelection();
  const { showError } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Re-fetch on every route change so that environments/applications created
    // or edited on their anagrafica pages are immediately reflected here.
    environmentsApi.list().then(setEnvironments).catch((err) => showError(describeError(err)));
    applicationsApi.list().then(setApplications).catch((err) => showError(describeError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="selector-bar">
      <label>
        Environment
        <select
          value={environmentId ?? ''}
          onChange={(e) => setEnvironmentId(e.target.value ? Number(e.target.value) : null)}
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
        Application
        <select
          value={applicationId ?? ''}
          onChange={(e) => setApplicationId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- select --</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
