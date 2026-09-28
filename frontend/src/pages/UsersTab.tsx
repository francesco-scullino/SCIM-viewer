import { FormEvent, useEffect, useState } from 'react';
import { scimApi } from '../api/scim';
import { ScimUser } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';

interface UserFormState {
  userName: string;
  givenName: string;
  familyName: string;
  email: string;
  active: boolean;
}

const emptyForm: UserFormState = { userName: '', givenName: '', familyName: '', email: '', active: true };

interface Props {
  applicationId: number;
  environmentId: number;
}

export function UsersTab({ applicationId, environmentId }: Props) {
  const [users, setUsers] = useState<ScimUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const { showError, showSuccess } = useToast();

  const load = () => {
    setLoading(true);
    scimApi
      .listUsers(applicationId, environmentId)
      .then((res) => setUsers(res.Resources ?? []))
      .catch((err) => showError(describeError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [applicationId, environmentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await scimApi.createUser(applicationId, environmentId, {
        userName: form.userName,
        givenName: form.givenName || undefined,
        familyName: form.familyName || undefined,
        email: form.email || undefined,
        active: form.active,
      });
      showSuccess('Utente creato');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleDelete = async (user: ScimUser) => {
    if (!confirm(`Eliminare l'utente "${user.userName}"?`)) return;
    try {
      await scimApi.deleteUser(applicationId, environmentId, user.id);
      showSuccess('Utente eliminato');
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Annulla' : 'Nuovo utente'}</button>
        <button className="secondary" onClick={load}>
          Aggiorna
        </button>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleSubmit}>
          <h3>Nuovo utente</h3>
          <label>
            Username
            <input required value={form.userName} onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))} />
          </label>
          <label>
            Nome
            <input value={form.givenName} onChange={(e) => setForm((f) => ({ ...f, givenName: e.target.value }))} />
          </label>
          <label>
            Cognome
            <input value={form.familyName} onChange={(e) => setForm((f) => ({ ...f, familyName: e.target.value }))} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Attivo
          </label>
          <div className="form-actions">
            <button type="submit">Crea utente</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.userName}</td>
                <td>
                  {[user.name?.givenName, user.name?.familyName].filter(Boolean).join(' ') || '-'}
                </td>
                <td>{user.emails?.[0]?.value || '-'}</td>
                <td>{user.active === false ? 'Disattivo' : 'Attivo'}</td>
                <td className="actions">
                  <button className="danger" onClick={() => handleDelete(user)}>
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5}>Nessun utente trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
