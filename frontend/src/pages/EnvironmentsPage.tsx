import { FormEvent, useEffect, useState } from 'react';
import { environmentsApi } from '../api/environments';
import { Environment } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';

interface FormState {
  id: number | null;
  name: string;
  tokenEndpoint: string;
  scope: string;
}

const emptyForm: FormState = { id: null, name: '', tokenEndpoint: '', scope: '' };

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const load = () => {
    setLoading(true);
    environmentsApi
      .list()
      .then(setEnvironments)
      .catch((err) => showError(describeError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, tokenEndpoint: form.tokenEndpoint, scope: form.scope || undefined };
      if (form.id != null) {
        await environmentsApi.update(form.id, payload);
        showSuccess('Ambiente aggiornato');
      } else {
        await environmentsApi.create(payload);
        showSuccess('Ambiente creato');
      }
      setForm(emptyForm);
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleEdit = (env: Environment) => {
    setForm({ id: env.id, name: env.name, tokenEndpoint: env.tokenEndpoint, scope: env.scope ?? '' });
  };

  const handleDelete = async (env: Environment) => {
    if (!confirm(`Eliminare l'ambiente "${env.name}"?`)) return;
    try {
      await environmentsApi.remove(env.id);
      showSuccess('Ambiente eliminato');
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  return (
    <section>
      <h2>Anagrafica Ambienti</h2>
      <p className="hint">
        Ogni ambiente (es. dev, pre, prod) definisce il Token Endpoint OIDC usato per ottenere il token
        client-credentials, comune a tutte le applicazioni configurate su quell'ambiente.
      </p>

      <form className="card-form" onSubmit={handleSubmit}>
        <h3>{form.id != null ? 'Modifica ambiente' : 'Nuovo ambiente'}</h3>
        <label>
          Nome
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="dev / pre / prod"
          />
        </label>
        <label>
          Token Endpoint
          <input
            required
            type="url"
            value={form.tokenEndpoint}
            onChange={(e) => setForm((f) => ({ ...f, tokenEndpoint: e.target.value }))}
            placeholder="https://idp.example.com/oauth2/token"
          />
        </label>
        <label>
          Scope di default (opzionale)
          <input value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} />
        </label>
        <div className="form-actions">
          <button type="submit">{form.id != null ? 'Salva modifiche' : 'Crea ambiente'}</button>
          {form.id != null && (
            <button type="button" className="secondary" onClick={() => setForm(emptyForm)}>
              Annulla
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Token Endpoint</th>
              <th>Scope</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {environments.map((env) => (
              <tr key={env.id}>
                <td>{env.name}</td>
                <td>{env.tokenEndpoint}</td>
                <td>{env.scope || '-'}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(env)}>Modifica</button>
                  <button className="danger" onClick={() => handleDelete(env)}>
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
            {environments.length === 0 && (
              <tr>
                <td colSpan={4}>Nessun ambiente configurato.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
