import { useState } from 'react';
import { useSelection } from '../components/SelectionContext';
import { UsersTab } from './UsersTab';
import { GroupsTab } from './GroupsTab';

export function UsersGroupsPage() {
  const { environmentId, applicationId } = useSelection();
  const [tab, setTab] = useState<'users' | 'groups'>('users');

  if (environmentId == null || applicationId == null) {
    return (
      <section>
        <h2>Users &amp; Groups</h2>
        <p className="hint">Select an environment and an application from the bar above to get started.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Users &amp; Groups</h2>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'groups' ? 'active' : ''} onClick={() => setTab('groups')}>
          Groups
        </button>
      </div>
      {tab === 'users' ? (
        <UsersTab applicationId={applicationId} environmentId={environmentId} />
      ) : (
        <GroupsTab applicationId={applicationId} environmentId={environmentId} />
      )}
    </section>
  );
}
