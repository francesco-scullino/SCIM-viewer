import { useEffect, useState } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { environmentsApi } from '../api/environments';
import { applicationsApi } from '../api/applications';
import { Environment, Application } from '../api/types';
import { useSelection } from './SelectionContext';
import { useToast, describeError } from './ToastContext';
import { DataError } from './EmptyState';

export interface SelectorRegistry { environmentIds: number[]; applicationIds: number[] }
export function EnvironmentAppSelector({ onRegistryChange }: { onRegistryChange: (registry: SelectorRegistry | null) => void }) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const { environmentId, applicationId, setEnvironmentId, setApplicationId } = useSelection();
  const { showError } = useToast();
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    onRegistryChange(null);
    setError('');
    Promise.all([environmentsApi.list(), applicationsApi.list()]).then(([envs, apps]) => {
      if (cancelled) return;
      setEnvironments(envs);
      setApplications(apps);
      setLoaded(true);
      onRegistryChange({ environmentIds: envs.map((env) => env.id), applicationIds: apps.map((app) => app.id) });
    }).catch((err) => {
      if (cancelled) return;
      const message = describeError(err);
      setError(message);
      showError(message);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // Registry changes are reflected when returning to this route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, retry, onRegistryChange]);

  useEffect(() => {
    if (!loaded) return;
    if (environmentId != null && !environments.some((env) => env.id === environmentId)) setEnvironmentId(null);
    if (applicationId != null && !applications.some((app) => app.id === applicationId)) setApplicationId(null);
  }, [loaded, environments, applications, environmentId, applicationId, setEnvironmentId, setApplicationId]);

  const environment = environments.find((env) => env.id === environmentId);
  const application = applications.find((app) => app.id === applicationId);
  const selected = Boolean(environment && application);

  return <>
    <div className="selector-bar" aria-label="Active SCIM context" aria-busy={loading}>
      <label>Environment<select value={environmentId ?? ''} disabled={loading || Boolean(error)} onChange={(e) => setEnvironmentId(e.target.value ? Number(e.target.value) : null)}>
        <option value="">{loading ? 'Loading environments…' : 'Select environment'}</option>
        {environments.map((env) => <option key={env.id} value={env.id}>{env.name}</option>)}
      </select></label>
      <ArrowRightOutlined className="context-arrow" aria-hidden="true" />
      <label>Application<select value={applicationId ?? ''} disabled={loading || Boolean(error)} onChange={(e) => setApplicationId(e.target.value ? Number(e.target.value) : null)}>
        <option value="">{loading ? 'Loading applications…' : 'Select application'}</option>
        {applications.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
      </select></label>
      <div className="context-summary" aria-live="polite"><strong className="context-path">{selected ? environment!.name + ' / ' + application!.name : 'Choose your context'}</strong><span>{selected ? 'All identity actions use this selection' : 'Select both to manage identities'}</span></div>
    </div>
    {error && <div className="context-error"><DataError message={error} onRetry={() => setRetry((value) => value + 1)} /></div>}
  </>;
}
