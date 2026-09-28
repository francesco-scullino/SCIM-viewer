import { del, get, patch, post } from './client';
import { ScimGroup, ScimListResponse, ScimUser } from './types';

function buildQuery(filter?: string): string {
  if (!filter) return '';
  return `?${new URLSearchParams({ filter }).toString()}`;
}

export const scimApi = {
  listUsers: (applicationId: number, environmentId: number, filter?: string) =>
    get<ScimListResponse<ScimUser>>(`/scim/${applicationId}/${environmentId}/users${buildQuery(filter)}`),
  createUser: (
    applicationId: number,
    environmentId: number,
    input: { userName: string; givenName?: string; familyName?: string; email?: string; active?: boolean }
  ) => post<ScimUser>(`/scim/${applicationId}/${environmentId}/users`, input),
  deleteUser: (applicationId: number, environmentId: number, userId: string) =>
    del<void>(`/scim/${applicationId}/${environmentId}/users/${encodeURIComponent(userId)}`),

  listGroups: (applicationId: number, environmentId: number, filter?: string) =>
    get<ScimListResponse<ScimGroup>>(`/scim/${applicationId}/${environmentId}/groups${buildQuery(filter)}`),
  createGroup: (applicationId: number, environmentId: number, input: { displayName: string }) =>
    post<ScimGroup>(`/scim/${applicationId}/${environmentId}/groups`, input),
  deleteGroup: (applicationId: number, environmentId: number, groupId: string) =>
    del<void>(`/scim/${applicationId}/${environmentId}/groups/${encodeURIComponent(groupId)}`),

  updateGroupMember: (
    applicationId: number,
    environmentId: number,
    groupId: string,
    input: { op: 'add' | 'remove'; userId: string }
  ) => patch<ScimGroup>(`/scim/${applicationId}/${environmentId}/groups/${encodeURIComponent(groupId)}/members`, input),
};
