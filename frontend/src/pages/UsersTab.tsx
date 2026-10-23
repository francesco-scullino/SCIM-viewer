import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlusOutlined, ReloadOutlined, DeleteOutlined, SearchOutlined, UserOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { scimApi } from '../api/scim';
import { ScimGroup, ScimUser } from '../api/types';
import { buildStartsWithFilter } from '../api/scimFilter';
import { useToast, describeError } from '../components/ToastContext';
import { UserDrawer } from '../components/UserDrawer';
import { UserGroupsDrawer, getMemberGroupIds } from '../components/UserGroupsDrawer';
import { IconButton } from '../components/IconButton';
import { Loader } from '../components/Loader';
import { EmptyState, DataError } from '../components/EmptyState';

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const requestId = useRef(0);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showError, showSuccess } = useToast();

  const [groups, setGroups] = useState<ScimGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsSubmitting, setGroupsSubmitting] = useState(false);
  const [groupsDrawerUser, setGroupsDrawerUser] = useState<ScimUser | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const groupsRequestId = useRef(0);

  const load = (searchTerm: string) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError('');
    scimApi.listUsers(applicationId, environmentId, buildStartsWithFilter('userName', searchTerm))
      .then((res) => { if (currentRequest === requestId.current) setUsers(res.Resources ?? []); })
      .catch((err) => { if (currentRequest !== requestId.current) return; const message = describeError(err); setLoadError(message); showError(message); })
      .finally(() => { if (currentRequest === requestId.current) setLoading(false); });
  };

  const loadGroups = (onLoaded?: (groups: ScimGroup[]) => void) => {
    const currentRequest = ++groupsRequestId.current;
    setGroupsLoading(true);
    scimApi.listGroups(applicationId, environmentId)
      .then((res) => {
        if (currentRequest !== groupsRequestId.current) return;
        const fetchedGroups = res.Resources ?? [];
        setGroups(fetchedGroups);
        onLoaded?.(fetchedGroups);
      })
      .catch((err) => { if (currentRequest === groupsRequestId.current) showError(describeError(err)); })
      .finally(() => { if (currentRequest === groupsRequestId.current) setGroupsLoading(false); });
  };

  const groupCountByUserId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const group of groups) {
      for (const member of group.members ?? []) {
        counts.set(member.value, (counts.get(member.value) ?? 0) + 1);
      }
    }
    return counts;
  }, [groups]);

  const formatGroupCount = (userId: string) => {
    const count = groupCountByUserId.get(userId) ?? 0;
    return `${count} ${count === 1 ? 'group' : 'groups'}`;
  };

  useEffect(() => {
    const handle = setTimeout(() => load(search), search ? 350 : 0);
    return () => { clearTimeout(handle); requestId.current += 1; };
    // Each context has a fresh component instance; discard outdated search responses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, applicationId, environmentId]);

  useEffect(() => {
    loadGroups();
    return () => { groupsRequestId.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, environmentId]);

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
      load(search);
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
      load(search);
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

  const handleOpenGroupsDrawer = (user: ScimUser) => {
    setGroupsDrawerUser(user);
    loadGroups((fetchedGroups) => setSelectedGroupIds(getMemberGroupIds(fetchedGroups, user.id)));
  };

  const handleCloseGroupsDrawer = () => {
    groupsRequestId.current += 1;
    setGroupsDrawerUser(null);
    setSelectedGroupIds(new Set());
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  };

  const handleSaveGroups = async () => {
    if (!groupsDrawerUser) return;
    const memberGroupIds = getMemberGroupIds(groups, groupsDrawerUser.id);
    const toAdd = groups.filter((g) => selectedGroupIds.has(g.id) && !memberGroupIds.has(g.id));
    const toRemove = groups.filter((g) => !selectedGroupIds.has(g.id) && memberGroupIds.has(g.id));
    setGroupsSubmitting(true);
    try {
      for (const g of toAdd) {
        await scimApi.updateGroupMember(applicationId, environmentId, g.id, { op: 'add', userId: groupsDrawerUser.id });
      }
      for (const g of toRemove) {
        await scimApi.updateGroupMember(applicationId, environmentId, g.id, { op: 'remove', userId: groupsDrawerUser.id });
      }
      showSuccess('Group membership updated');
      handleCloseGroupsDrawer();
      loadGroups();
    } catch (err) {
      showError(describeError(err));
    } finally {
      setGroupsSubmitting(false);
    }
  };

  return (
    <div className="data-panel" aria-busy={loading}>
      <div className="table-toolbar">
        <div className="toolbar-search"><Input allowClear placeholder="Search by username" aria-label="Search users by username" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" /><span className="result-count" aria-live="polite">{loading ? 'Loading…' : loadError ? 'Unavailable' : users.length + (users.length === 1 ? ' user' : ' users')}</span></div>
        <div className="toolbar-actions"><IconButton icon={<ReloadOutlined />} label="Refresh users" className="secondary" disabled={loading} onClick={() => { load(search); loadGroups(); }} /><IconButton icon={<PlusOutlined />} label="New user" showLabel onClick={handleOpenDrawer} /></div>
      </div>
      <UserDrawer open={drawerOpen} form={form} onClose={handleCloseDrawer} onSubmit={handleSubmit} onChange={setForm} isLoading={submitting} />
      <UserGroupsDrawer
        open={groupsDrawerUser != null}
        user={groupsDrawerUser}
        groups={groups}
        selectedGroupIds={selectedGroupIds}
        onToggleGroup={handleToggleGroup}
        onClose={handleCloseGroupsDrawer}
        onSubmit={handleSaveGroups}
        isLoading={groupsLoading}
        isSubmitting={groupsSubmitting}
      />
      {loading ? <Loader label="Loading users…" /> : loadError ? <DataError message={loadError} onRetry={() => load(search)} /> : users.length === 0 ? (
        <EmptyState icon={<UserOutlined />} title={search ? 'No matching users' : 'No users in this context'} description={search ? 'Try a different username prefix or clear your search.' : 'Create a user to add the first identity to this application and environment.'} action={search ? <button type="button" className="secondary" onClick={() => setSearch('')}>Clear search</button> : <IconButton icon={<PlusOutlined />} label="New user" showLabel onClick={handleOpenDrawer} />} />
      ) : <div className="table-scroll" role="region" aria-label="Users table" tabIndex={0}><table className="data-table">
        <caption className="visually-hidden">Users in the selected application and environment</caption>
        <thead><tr><th scope="col">Name</th><th scope="col">Groups</th><th scope="col">Status</th><th scope="col" className="actions-heading">Actions</th></tr></thead>
        <tbody>{users.map((user) => <tr key={user.id}>
          <td><div className="identity-cell"><span className="identity-avatar" aria-hidden="true">{Array.from(user.userName).slice(0, 2).join('').toUpperCase()}</span><div className="identity-info"><span className="identity-name">{[user.name?.givenName, user.name?.familyName].filter(Boolean).join(' ') || '—'}</span><span className="identity-username">{user.userName}</span></div></div></td>
          <td><span className="member-count">{formatGroupCount(user.id)}</span></td>
          <td><span className={'status-badge' + (user.active === false ? ' inactive' : '')}>{user.active === false ? 'Inactive' : 'Active'}</span></td>
          <td className="actions"><IconButton icon={<UsergroupAddOutlined />} label={'Manage groups for ' + user.userName} onClick={() => handleOpenGroupsDrawer(user)} /><IconButton icon={<DeleteOutlined />} label={'Delete user ' + user.userName} danger onClick={() => handleDelete(user)} /></td>
        </tr>)}</tbody>
      </table></div>}
      {!loading && !loadError && users.length > 0 && <div className="table-footer"><span>{users.length} {users.length === 1 ? 'user' : 'users'} shown</span><span>Search matches the beginning of a username</span></div>}
    </div>
  );
}
