export interface Environment {
  id: number;
  name: string;
  tokenEndpoint: string;
  scope: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppEnvironmentConfig {
  id: number;
  applicationId: number;
  environmentId: number;
  clientId: string;
  clientSecret: string;
  scimBaseUrl: string;
  scope: string | null;
  createdAt: string;
  updatedAt: string;
  applicationName?: string;
  environmentName?: string;
}

export interface ScimName {
  givenName?: string;
  familyName?: string;
  formatted?: string;
}

export interface ScimEmail {
  value: string;
  primary?: boolean;
  type?: string;
}

export interface ScimUser {
  id: string;
  userName: string;
  name?: ScimName;
  emails?: ScimEmail[];
  active?: boolean;
  [key: string]: unknown;
}

export interface ScimGroupMemberRef {
  value: string;
  display?: string;
  $ref?: string;
}

export interface ScimGroup {
  id: string;
  displayName: string;
  members?: ScimGroupMemberRef[];
  [key: string]: unknown;
}

export interface ScimListResponse<T> {
  Resources?: T[];
  totalResults?: number;
  itemsPerPage?: number;
  startIndex?: number;
  [key: string]: unknown;
}
