import { Fragment, FormEvent, useEffect, useState } from 'react';
import { scimApi } from '../api/scim';
import { ScimGroup, ScimUser } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';

interface Props {
  applicationId: number;
  environmentId: number;
}

export function GroupsTab({ applicationId, environmentId }: Props) {
  const [groups, setGroups] = useState<ScimGroup[]>([]);
  const [users, setUsers] = useState<ScimUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState('');
  const { showError, showSuccess } = useToast();

  const loadGroups = () => {
    setLoading(true);
    scimApi
      .listGroups(applicationId, environmentId)
      .then((res) => setGroups(res.Resources ?? []))
      .catch((err) => showError(describeError(err)))
      .finally(() => setLoading(false));
  };

  const loadUsers = () => {
    scimApi
      .listUsers(applicationId, environmentId)
      .then((res) => setUsers(res.Resources ?? []))
      .catch((err) => showError(describeError(err)));
  };

  useEffect(() => {
    loadGroups();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, environmentId]);

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await scimApi.createGroup(applicationId, environmentId, { displayName });
      showSuccess('Gruppo creato');
      setDisplayName('');
      setShowForm(false);
      loadGroups();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleDeleteGroup = async (group: ScimGroup) => {
    if (!confirm(`Eliminare il gruppo "${group.displayName}"?`)) return;
    try {
      await scimApi.deleteGroup(applicationId, environmentId, group.id);
      showSuccess('Gruppo eliminato');
      if (expandedGroupId === group.id) setExpandedGroupId(null);
      loadGroups();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const toggleMembers = (group: ScimGroup) => {
    setExpandedGroupId((current) => (current === group.id ? null : group.id));
    setAddUserId('');
  };

  const handleAddMember = async (group: ScimGroup) => {
    if (!addUserId) return;
    try {
      await scimApi.updateGroupMember(applicationId, environmentId, group.id, { op: 'add', userId: addUserId });
      showSuccess('Utente aggiunto al gruppo');
      setAddUserId('');
      loadGroups();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleRemoveMember = async (group: ScimGroup, userId: string) => {
    try {
      await scimApi.updateGroupMember(applicationId, environmentId, group.id, { op: 'remove', userId });
      showSuccess('Utente rimosso dal gruppo');
      loadGroups();
    } catch (err) {
      showError(describeError(err));
    }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Annulla' : 'Nuovo gruppo'}</button>
        <button
          className="secondary"
          onClick={() => {
            loadGroups();
            loadUsers();
          }}
        >
          Aggiorna
        </button>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleCreateGroup}>
          <h3>Nuovo gruppo</h3>
          <label>
            Nome gruppo
            <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="submit">Crea gruppo</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome gruppo</th>
              <th>Membri</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <td>{group.displayName}</td>
                  <td>{group.members?.length ?? 0}</td>
                  <td className="actions">
                    <button onClick={() => toggleMembers(group)}>
                      {expandedGroupId === group.id ? 'Chiudi membri' : 'Gestisci membri'}
                    </button>
                    <button className="danger" onClick={() => handleDeleteGroup(group)}>
                      Elimina
                    </button>
                  </td>
                </tr>
                {expandedGroupId === group.id && (
                  <tr key={`${group.id}-members`}>
                    <td colSpan={3}>
                      <div className="nested-panel">
                        <h4>Membri di {group.displayName}</h4>
                        <ul className="member-list">
                          {(group.members ?? []).map((member) => (
                            <li key={member.value}>
                              {member.display || member.value}
                              <button className="danger small" onClick={() => handleRemoveMember(group, member.value)}>
                                Rimuovi
                              </button>
                            </li>
                          ))}
                          {(group.members ?? []).length === 0 && <li>Nessun membro.</li>}
                        </ul>
                        <div className="add-member-row">
                          <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)}>
                            <option value="">-- seleziona utente --</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.userName}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => handleAddMember(group)} disabled={!addUserId}>
                            Aggiungi al gruppo
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3}>Nessun gruppo trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
