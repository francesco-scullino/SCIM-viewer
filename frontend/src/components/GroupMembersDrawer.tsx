import { Drawer } from 'antd';
import { ScimGroup, ScimGroupMemberRef, ScimUser } from '../api/types';

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
      <ul className="member-list">
        {(group?.members ?? []).map((member) => (
          <li key={member.value}>
            {formatMemberLabel(member)}
            <button className="danger small" onClick={() => onRemoveMember(member.value)}>
              Remove
            </button>
          </li>
        ))}
        {(group?.members ?? []).length === 0 && <li>No members.</li>}
      </ul>
      <div className="add-member-row">
        <select value={addUserId} onChange={(e) => onAddUserIdChange(e.target.value)}>
          <option value="">-- select user --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {formatUserLabel(user)}
            </option>
          ))}
        </select>
        <button onClick={onAddMember} disabled={!addUserId}>
          Add to group
        </button>
      </div>
    </Drawer>
  );
}
