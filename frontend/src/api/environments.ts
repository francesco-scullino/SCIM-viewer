import { del, get, post, put } from './client';
import { Environment } from './types';

export const environmentsApi = {
  list: () => get<Environment[]>('/environments'),
  create: (input: { name: string; tokenEndpoint: string; scope?: string }) =>
    post<Environment>('/environments', input),
  update: (id: number, input: { name: string; tokenEndpoint: string; scope?: string }) =>
    put<Environment>(`/environments/${id}`, input),
  remove: (id: number) => del<void>(`/environments/${id}`),
};
