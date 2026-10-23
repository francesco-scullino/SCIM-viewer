import { Drawer } from 'antd';
import { FormEvent, useId } from 'react';
import { ScimGroup, ScimUser } from '../api/types';
import { EmptyState } from './EmptyState';
import { SubmitButton } from './SubmitButton';

interface UserGroupsDrawerProps {
  open: boolean;
  user: ScimUser | null;
  groups: ScimGroup[];
  selectedGroupIds: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function getMemberGroupIds(groups: ScimGroup[], userId?: string): Set<string> {
  return new Set(groups.filter((g) => g.members?.some((m) => m.value === userId)).map((g) => g.id));
}

export function UserGroupsDrawer({
  open,
  user,
  groups,
  selectedGroupIds,
  onToggleGroup,
  onClose,
  onSubmit,
  isLoading,
  isSubmitting,
}: UserGroupsDrawerProps) {
  const memberGroupIds = getMemberGroupIds(groups, user?.id);
  const hasChanges = groups.some((g) => selectedGroupIds.has(g.id) !== memberGroupIds.has(g.id));
  const formId = useId();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Drawer
      title={user ? `Groups for ${user.userName}` : 'Groups'}
      onClose={onClose}
      open={open}
      size={420}
      footer={
        <div className="drawer-footer-actions">
          <SubmitButton form={formId} loading={isSubmitting} disabled={!hasChanges}>
            Save group membership
          </SubmitButton>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      }
    >
      <p className="hint">Check or uncheck groups to add or remove this user from them.</p>
      <form id={formId} className="drawer-form" onSubmit={handleSubmit}>
        {isLoading ? (
          <p className="hint">Loading groups…</p>
        ) : groups.length === 0 ? (
          <EmptyState title="No groups in this context" description="Create a group first, then come back to assign this user." />
        ) : (
          <ul className="group-checklist">
            {groups.map((group) => (
              <li key={group.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedGroupIds.has(group.id)}
                    onChange={() => onToggleGroup(group.id)}
                  />
                  {group.displayName}
                </label>
              </li>
            ))}
          </ul>
        )}
      </form>
    </Drawer>
  );
}
