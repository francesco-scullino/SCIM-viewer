import { Drawer } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { ScimGroup, ScimGroupMemberRef, ScimUser } from '../api/types';
import { EmptyState } from './EmptyState';
import { IconButton } from './IconButton';

interface GroupMembersDrawerProps {
  open: boolean;
  group: ScimGroup | null;
  users: ScimUser[];
  addUserId: string;
  onClose: () => void;
  onAddUserIdChange: (userId: string) => void;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
  formatMemberLabel: (member: ScimGroupMemberRef) => string;
  formatUserLabel: (user: ScimUser) => string;
}

export function GroupMembersDrawer({
  open,
  group,
  users,
  addUserId,
  onClose,
  onAddUserIdChange,
  onAddMember,
  onRemoveMember,
  formatMemberLabel,
  formatUserLabel,
}: GroupMembersDrawerProps) {
  return (
    <Drawer title={group ? `Members of ${group.displayName}` : 'Members'} onClose={onClose} open={open} size={480}>
      <p className="hint">Add or remove users from this group in the selected context.</p>
      <ul className="member-list">
        {(group?.members ?? []).map((member) => (
          <li key={member.value}>
            <span className="member-label">{formatMemberLabel(member)}</span>
            <IconButton
              icon={<UserDeleteOutlined />}
              label={'Remove ' + formatMemberLabel(member)}
              danger
              onClick={() => onRemoveMember(member.value)}
            />
          </li>
        ))}
        {(group?.members ?? []).length === 0 && <li><EmptyState title="No members yet" description="Select a user below to add them to this group." /></li>}
      </ul>
      <label className="member-add-label" htmlFor="member-user">Add a member</label>
      <div className="add-member-row">
        <select id="member-user" value={addUserId} onChange={(e) => onAddUserIdChange(e.target.value)}>
          <option value="">-- select user --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {formatUserLabel(user)}
            </option>
          ))}
        </select>
        <IconButton icon={<UserAddOutlined />} label="Add to group" showLabel onClick={onAddMember} disabled={!addUserId} />
      </div>
    </Drawer>
  );
}
