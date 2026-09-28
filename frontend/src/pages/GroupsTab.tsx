import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [membersGroupId, setMembersGroupId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState('');
  const [search, setSearch] = useState('');
  const { showError, showSuccess } = useToast();

  const loadGroups = (searchTerm: string) => {
    setLoading(true);
    scimApi
      .listGroups(applicationId, environmentId, buildStartsWithFilter('displayName', searchTerm))
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
    setSearch('');
    loadGroups('');
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, environmentId]);

  useEffect(() => {
    const handle = setTimeout(() => loadGroups(search), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
    <div>
      <div className="tab-toolbar">
        <IconButton icon={<PlusOutlined />} label="New group" onClick={handleOpenGroupDrawer} />
        <IconButton
          icon={<ReloadOutlined />}
          label="Refresh"
          onClick={() => {
            loadGroups(search);
            loadUsers();
          }}
        />
        <Input
          allowClear
          placeholder="Search by group name"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <GroupDrawer
        open={groupDrawerOpen}
        displayName={displayName}
        onClose={handleCloseGroupDrawer}
        onSubmit={handleCreateGroup}
        onChange={setDisplayName}
        isLoading={groupSubmitting}
      />

      <GroupMembersDrawer
        open={membersGroupId != null}
        group={membersGroup}
        users={users}
        addUserId={addUserId}
        onClose={closeMembers}
        onAddUserIdChange={setAddUserId}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        formatMemberLabel={(member) => formatMemberLabel(member, usersById)}
        formatUserLabel={formatUserLabel}
      />

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Group name</th>
              <th>Members</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.displayName}</td>
                <td>{group.members?.length ?? 0}</td>
                <td className="actions">
                  <IconButton icon={<TeamOutlined />} label="Manage members" onClick={() => openMembers(group)} />
                  <IconButton icon={<DeleteOutlined />} label="Delete" danger onClick={() => handleDeleteGroup(group)} />
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3}>No groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
