import { useRef, useState, KeyboardEvent } from 'react';
import { ApartmentOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelection } from '../components/SelectionContext';
import { EnvironmentAppSelector, SelectorRegistry } from '../components/EnvironmentAppSelector';
import { PageHeader } from '../components/PageHeader';
import { UsersTab } from './UsersTab';
import { GroupsTab } from './GroupsTab';

export function UsersGroupsPage() {
  const { environmentId, applicationId } = useSelection();
  const [tab, setTab] = useState<'users' | 'groups'>('users');
  const [registry, setRegistry] = useState<SelectorRegistry | null>(null);
  const usersButton = useRef<HTMLButtonElement>(null);
  const groupsButton = useRef<HTMLButtonElement>(null);
  const selected = environmentId != null && applicationId != null && registry != null && registry.environmentIds.includes(environmentId) && registry.applicationIds.includes(applicationId);
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'users' : event.key === 'End' ? 'groups' : tab === 'users' ? 'groups' : 'users';
    setTab(next);
    (next === 'users' ? usersButton : groupsButton).current?.focus();
  };
  return <section aria-label="Users and groups workspace">
    <PageHeader title="Users & Groups" description="Inspect identities and manage group memberships in the selected context." />
    <EnvironmentAppSelector onRegistryChange={setRegistry} />
    {!selected ? <div className="setup-state"><div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true"><ApartmentOutlined /></span>
      <h3>Your identity workspace starts here</h3>
      <p>Select an environment and an application above to load their users and groups.</p>
      <ol className="setup-steps">
        <li><span><Link to="/environments">Register an environment</Link><br />Define the identity provider and token endpoint.</span></li>
        <li><span><Link to="/applications">Configure an application</Link><br />Add its credentials and SCIM URL for that environment.</span></li>
        <li><span><strong>Select a context above</strong><br />View users, groups and their memberships.</span></li>
      </ol>
    </div></div> : <>
      <div className="tabs" role="tablist" aria-label="Identity resource">
        <button ref={usersButton} id="users-tab" role="tab" aria-selected={tab === 'users'} aria-controls="identity-panel" tabIndex={tab === 'users' ? 0 : -1} className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')} onKeyDown={handleTabKey}><UserOutlined aria-hidden="true" />Users</button>
        <button ref={groupsButton} id="groups-tab" role="tab" aria-selected={tab === 'groups'} aria-controls="identity-panel" tabIndex={tab === 'groups' ? 0 : -1} className={tab === 'groups' ? 'active' : ''} onClick={() => setTab('groups')} onKeyDown={handleTabKey}><TeamOutlined aria-hidden="true" />Groups</button>
      </div>
      <div role="tabpanel" id="identity-panel" aria-labelledby={tab + '-tab'}>
        {tab === 'users' ? <UsersTab key={applicationId + ':' + environmentId} applicationId={applicationId!} environmentId={environmentId!} /> : <GroupsTab key={applicationId + ':' + environmentId} applicationId={applicationId!} environmentId={environmentId!} />}
      </div>
    </>}
  </section>;
}
