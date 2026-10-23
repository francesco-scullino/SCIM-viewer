import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlusOutlined, ReloadOutlined, TeamOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { scimApi } from '../api/scim';
import { ScimGroup, ScimGroupMemberRef, ScimUser } from '../api/types';
import { buildStartsWithFilter } from '../api/scimFilter';
import { useToast, describeError } from '../components/ToastContext';
import { GroupDrawer } from '../components/GroupDrawer';
import { GroupMembersDrawer } from '../components/GroupMembersDrawer';
import { IconButton } from '../components/IconButton';
import { Loader } from '../components/Loader';
import { EmptyState, DataError } from '../components/EmptyState';

function formatMemberLabel(member: ScimGroupMemberRef, usersById: Map<string, ScimUser>): string {
  const user = usersById.get(member.value);
  if (user) return formatUserLabel(user);
  return member.display || member.value;
}

function formatUserLabel(user: ScimUser): string {
  const fullName = [user.name?.givenName, user.name?.familyName].filter(Boolean).join(' ');
  return fullName ? `${fullName} (${user.userName})` : user.userName;
}

interface Props {
  applicationId: number;
  environmentId: number;
}

export function GroupsTab({ applicationId, environmentId }: Props) {
  const [groups, setGroups] = useState<ScimGroup[]>([]);
  const [users, setUsers] = useState<ScimUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const requestId = useRef(0);
  const usersRequestId = useRef(0);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [membersGroupId, setMembersGroupId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState('');
  const [search, setSearch] = useState('');
  const { showError, showSuccess } = useToast();

  const loadGroups = (searchTerm: string) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError('');
    scimApi.listGroups(applicationId, environmentId, buildStartsWithFilter('displayName', searchTerm))
      .then((res) => { if (currentRequest === requestId.current) setGroups(res.Resources ?? []); })
      .catch((err) => { if (currentRequest !== requestId.current) return; const message = describeError(err); setLoadError(message); showError(message); })
      .finally(() => { if (currentRequest === requestId.current) setLoading(false); });
  };

  const loadUsers = () => {
    const currentRequest = ++usersRequestId.current;
    scimApi.listUsers(applicationId, environmentId)
      .then((res) => { if (currentRequest === usersRequestId.current) setUsers(res.Resources ?? []); })
      .catch((err) => { if (currentRequest === usersRequestId.current) showError(describeError(err)); });
  };

  useEffect(() => {
    loadUsers();
    return () => { usersRequestId.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, environmentId]);

  useEffect(() => {
    const handle = setTimeout(() => loadGroups(search), search ? 350 : 0);
    return () => { clearTimeout(handle); requestId.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, applicationId, environmentId]);

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setGroupSubmitting(true);
    try {
      await scimApi.createGroup(applicationId, environmentId, { displayName });
      showSuccess('Group created');
      setDisplayName('');
      setGroupDrawerOpen(false);
      loadGroups(search);
    } catch (err) {
      showError(describeError(err));
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleDeleteGroup = async (group: ScimGroup) => {
    if (!confirm(`Delete group "${group.displayName}"?`)) return;
    try {
      await scimApi.deleteGroup(applicationId, environmentId, group.id);
      showSuccess('Group deleted');
      if (membersGroupId === group.id) setMembersGroupId(null);
      loadGroups(search);
    } catch (err) {
      showError(describeError(err));
    }
  };

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const openMembers = (group: ScimGroup) => {
    setMembersGroupId(group.id);
    setAddUserId('');
  };

  const closeMembers = () => {
    setMembersGroupId(null);
    setAddUserId('');
  };

  const membersGroup = groups.find((g) => g.id === membersGroupId) ?? null;

  const handleAddMember = async () => {
    if (!addUserId || membersGroupId == null) return;
    try {
      await scimApi.updateGroupMember(applicationId, environmentId, membersGroupId, { op: 'add', userId: addUserId });
      showSuccess('User added to group');
      setAddUserId('');
      loadGroups(search);
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (membersGroupId == null) return;
    try {
      await scimApi.updateGroupMember(applicationId, environmentId, membersGroupId, { op: 'remove', userId });
      showSuccess('User removed from group');
      loadGroups(search);
    } catch (err) {
      showError(describeError(err));
    }
  };

  const handleOpenGroupDrawer = () => {
    setDisplayName('');
    setGroupDrawerOpen(true);
  };

  const handleCloseGroupDrawer = () => {
    setDisplayName('');
    setGroupDrawerOpen(false);
  };

  return (
    <div className="data-panel" aria-busy={loading}>
      <div className="table-toolbar">
        <div className="toolbar-search"><Input allowClear placeholder="Search by group name" aria-label="Search groups by name" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" /><span className="result-count" aria-live="polite">{loading ? 'Loading…' : loadError ? 'Unavailable' : groups.length + (groups.length === 1 ? ' group' : ' groups')}</span></div>
        <div className="toolbar-actions"><IconButton icon={<ReloadOutlined />} label="Refresh groups" className="secondary" disabled={loading} onClick={() => { loadGroups(search); loadUsers(); }} /><IconButton icon={<PlusOutlined />} label="New group" showLabel onClick={handleOpenGroupDrawer} /></div>
      </div>
      <GroupDrawer open={groupDrawerOpen} displayName={displayName} onClose={handleCloseGroupDrawer} onSubmit={handleCreateGroup} onChange={setDisplayName} isLoading={groupSubmitting} />
      <GroupMembersDrawer open={membersGroupId != null} group={membersGroup} users={users} addUserId={addUserId} onClose={closeMembers} onAddUserIdChange={setAddUserId} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} formatMemberLabel={(member) => formatMemberLabel(member, usersById)} formatUserLabel={formatUserLabel} />
      {loading ? <Loader label="Loading groups…" /> : loadError ? <DataError message={loadError} onRetry={() => loadGroups(search)} /> : groups.length === 0 ? (
        <EmptyState icon={<TeamOutlined />} title={search ? 'No matching groups' : 'No groups in this context'} description={search ? 'Try a different group name prefix or clear your search.' : 'Create a group, then add users to organise their memberships.'} action={search ? <button type="button" className="secondary" onClick={() => setSearch('')}>Clear search</button> : <IconButton icon={<PlusOutlined />} label="New group" showLabel onClick={handleOpenGroupDrawer} />} />
      ) : <div className="table-scroll" role="region" aria-label="Groups table" tabIndex={0}><table className="data-table groups-table">
        <caption className="visually-hidden">Groups in the selected application and environment</caption>
        <thead><tr><th scope="col">Group name</th><th scope="col">Members</th><th scope="col" className="actions-heading">Actions</th></tr></thead>
        <tbody>{groups.map((group) => <tr key={group.id}>
          <td><div className="identity-cell"><span className="identity-avatar" aria-hidden="true"><TeamOutlined /></span><div><span className="identity-name">{group.displayName}</span><span className="identity-id" title={group.id}>{group.id}</span></div></div></td>
          <td><span className="member-count">{group.members?.length ?? 0} {(group.members?.length ?? 0) === 1 ? 'member' : 'members'}</span></td>
          <td className="actions"><IconButton icon={<TeamOutlined />} label="Manage members" showLabel className="secondary" onClick={() => openMembers(group)} /><IconButton icon={<DeleteOutlined />} label={'Delete group ' + group.displayName} danger onClick={() => handleDeleteGroup(group)} /></td>
        </tr>)}</tbody>
      </table></div>}
      {!loading && !loadError && groups.length > 0 && <div className="table-footer"><span>{groups.length} {groups.length === 1 ? 'group' : 'groups'} shown</span><span>Search matches the beginning of a group name</span></div>}
    </div>
  );
}
