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
        <h2>Utenti &amp; Gruppi</h2>
        <p className="hint">Seleziona un ambiente e un'applicazione dalla barra in alto per iniziare.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Utenti &amp; Gruppi</h2>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Utenti
        </button>
        <button className={tab === 'groups' ? 'active' : ''} onClick={() => setTab('groups')}>
          Gruppi
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
