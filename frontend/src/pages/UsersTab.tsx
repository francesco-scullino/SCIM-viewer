import { FormEvent, useEffect, useState } from 'react';
import { PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { scimApi } from '../api/scim';
import { ScimUser } from '../api/types';
import { useToast, describeError } from '../components/ToastContext';
import { UserDrawer } from '../components/UserDrawer';
import { IconButton } from '../components/IconButton';
import { Loader } from '../components/Loader';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    try {
      await scimApi.createUser(applicationId, environmentId, {
        userName: form.userName,
        givenName: form.givenName || undefined,
        familyName: form.familyName || undefined,
        email: form.email || undefined,
        active: form.active,
      });
      showSuccess('User created');
      setForm(emptyForm);
      setDrawerOpen(false);
      load();
    } catch (err) {
      showError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: ScimUser) => {
    if (!confirm(`Delete user "${user.userName}"?`)) return;
    try {
      await scimApi.deleteUser(applicationId, environmentId, user.id);
      showSuccess('User deleted');
      load();
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleOpenDrawer = () => {
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  return (
    <div>
      <div className="tab-toolbar">
        <IconButton icon={<PlusOutlined />} label="New user" onClick={handleOpenDrawer} />
        <IconButton icon={<ReloadOutlined />} label="Refresh" onClick={load} />
      </div>

      <UserDrawer
        open={drawerOpen}
        form={form}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        onChange={setForm}
        isLoading={submitting}
      />

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
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
                <td>{user.active === false ? 'Inactive' : 'Active'}</td>
                <td className="actions">
                  <IconButton icon={<DeleteOutlined />} label="Delete" danger onClick={() => handleDelete(user)} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
