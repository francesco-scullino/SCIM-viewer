import { Drawer } from 'antd';
import { FormEvent, useId } from 'react';
import { ScimGroup, ScimUser } from '../api/types';
import { EmptyState } from './EmptyState';
import { SubmitButton } from './SubmitButton';

interface GroupMembersDrawerProps {
  open: boolean;
  group: ScimGroup | null;
  users: ScimUser[];
  selectedMemberIds: Set<string>;
  currentMemberIds: Set<string>;
  onToggleMember: (userId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function GroupMembersDrawer({
  open,
  group,
  users,
  selectedMemberIds,
  currentMemberIds,
  onToggleMember,
  onClose,
  onSubmit,
  isLoading,
  isSubmitting,
}: GroupMembersDrawerProps) {
  const hasChanges = users.some((u) => selectedMemberIds.has(u.id) !== currentMemberIds.has(u.id));
  const formId = useId();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Drawer
      title={group ? `Members of ${group.displayName}` : 'Members'}
      onClose={onClose}
      open={open}
      size={480}
      footer={
        <div className="drawer-footer-actions">
          <SubmitButton form={formId} loading={isSubmitting} disabled={!hasChanges}>
            Save membership
          </SubmitButton>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      }
    >
      <p className="hint">Check or uncheck users to add or remove them from this group.</p>
      <form id={formId} className="drawer-form" onSubmit={handleSubmit}>
        {isLoading ? (
          <p className="hint">Loading users…</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users in this context" description="Create a user first, then come back to add them to the group." />
        ) : (
          <ul className="group-checklist">
            {users.map((user) => (
              <li key={user.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.has(user.id)}
                    onChange={() => onToggleMember(user.id)}
                  />
                  <div className="checkbox-label-info">
                    <span className="checkbox-label-name">{[user.name?.givenName, user.name?.familyName].filter(Boolean).join(' ') || user.userName}</span>
                    {user.userName && <span className="checkbox-label-username">{user.userName}</span>}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </form>
    </Drawer>
  );
}
