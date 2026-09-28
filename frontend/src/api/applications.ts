import { del, get, post, put } from './client';
import { Application, AppEnvironmentConfig } from './types';

export const applicationsApi = {
  list: () => get<Application[]>('/applications'),
  create: (input: { name: string; description?: string }) => post<Application>('/applications', input),
  update: (id: number, input: { name: string; description?: string }) =>
    put<Application>(`/applications/${id}`, input),
  remove: (id: number) => del<void>(`/applications/${id}`),

  listConfigs: (applicationId: number) =>
    get<AppEnvironmentConfig[]>(`/applications/${applicationId}/configs`),
  createConfig: (
    applicationId: number,
    input: { environmentId: number; clientId: string; clientSecret: string; scimBaseUrl: string; scope?: string }
  ) => post<AppEnvironmentConfig>(`/applications/${applicationId}/configs`, input),
  updateConfig: (
    applicationId: number,
    configId: number,
    input: { clientId: string; clientSecret: string; scimBaseUrl: string; scope?: string }
  ) => put<AppEnvironmentConfig>(`/applications/${applicationId}/configs/${configId}`, input),
  removeConfig: (applicationId: number, configId: number) =>
    del<void>(`/applications/${applicationId}/configs/${configId}`),
};
