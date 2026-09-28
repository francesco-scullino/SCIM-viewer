import { del, get, patch, post } from './client';
import { ScimGroup, ScimListResponse, ScimUser } from './types';

export const scimApi = {
  listUsers: (applicationId: number, environmentId: number) =>
    get<ScimListResponse<ScimUser>>(`/scim/${applicationId}/${environmentId}/users`),
  createUser: (
    applicationId: number,
    environmentId: number,
    input: { userName: string; givenName?: string; familyName?: string; email?: string; active?: boolean }
  ) => post<ScimUser>(`/scim/${applicationId}/${environmentId}/users`, input),
  deleteUser: (applicationId: number, environmentId: number, userId: string) =>
    del<void>(`/scim/${applicationId}/${environmentId}/users/${encodeURIComponent(userId)}`),

  listGroups: (applicationId: number, environmentId: number) =>
    get<ScimListResponse<ScimGroup>>(`/scim/${applicationId}/${environmentId}/groups`),
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
