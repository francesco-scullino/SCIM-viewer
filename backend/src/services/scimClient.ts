import fetch from 'node-fetch';
import { getAccessToken, getScimBaseUrl, TokenServiceError } from './tokenService';

export class ScimClientError extends Error {
  constructor(message: string, public status = 502, public details?: unknown) {
    super(message);
  }
}

function joinUrl(base: string, pathSegment: string): string {
  return `${base.replace(/\/+$/, '')}/${pathSegment.replace(/^\/+/, '')}`;
}

async function scimRequest(
  applicationId: number,
  environmentId: number,
  pathSegment: string,
  options: { method: string; body?: unknown; query?: string }
): Promise<any> {
  const baseUrl = await getScimBaseUrl(applicationId, environmentId);
  const token = await getAccessToken(applicationId, environmentId);

  let url = joinUrl(baseUrl, pathSegment);
  if (options.query) url += `?${options.query}`;

  let response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/scim+json',
        Accept: 'application/scim+json',
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err: any) {
    throw new ScimClientError(`Unable to reach SCIM API: ${err.message}`, 502);
  }

  const text = await response.text();
  let json: any = undefined;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!response.ok) {
    const detail = json?.detail || json?.error_description || response.statusText;
    throw new ScimClientError(`SCIM API error: ${detail}`, response.status, json);
  }

  return json;
}

export async function scimGet(applicationId: number, environmentId: number, pathSegment: string, query?: string) {
  return scimRequest(applicationId, environmentId, pathSegment, { method: 'GET', query });
}

export async function scimPost(applicationId: number, environmentId: number, pathSegment: string, body: unknown) {
  return scimRequest(applicationId, environmentId, pathSegment, { method: 'POST', body });
}

export async function scimPatch(applicationId: number, environmentId: number, pathSegment: string, body: unknown) {
  return scimRequest(applicationId, environmentId, pathSegment, { method: 'PATCH', body });
}

export async function scimDelete(applicationId: number, environmentId: number, pathSegment: string) {
  return scimRequest(applicationId, environmentId, pathSegment, { method: 'DELETE' });
}

export { TokenServiceError };
