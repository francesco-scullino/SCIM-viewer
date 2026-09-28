import fetch from 'node-fetch';
import { getEnvironment } from '../db/environmentsRepo';
import { getConfigByAppAndEnv } from '../db/configsRepo';

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

const tokenCache = new Map<string, CachedToken>();

function cacheKey(applicationId: number, environmentId: number): string {
  return `${applicationId}:${environmentId}`;
}

export function clearCachedToken(applicationId: number, environmentId: number): void {
  tokenCache.delete(cacheKey(applicationId, environmentId));
}

export class TokenServiceError extends Error {
  constructor(message: string, public status = 502, public details?: unknown) {
    super(message);
  }
}

/**
 * Retrieves a valid OAuth2 client-credentials access token for the given
 * application + environment pair, using an in-memory cache until the token
 * is close to expiry.
 */
export async function getAccessToken(applicationId: number, environmentId: number): Promise<string> {
  const key = cacheKey(applicationId, environmentId);
  const cached = tokenCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt - 30_000 > now) {
    return cached.accessToken;
  }

  const environment = getEnvironment(environmentId);
  if (!environment) {
    throw new TokenServiceError('Environment not found', 404);
  }
  const config = getConfigByAppAndEnv(applicationId, environmentId);
  if (!config) {
    throw new TokenServiceError(
      'No configuration (client id/secret/SCIM base URL) found for this application and environment',
      400
    );
  }

  const scope = config.scope ?? environment.scope ?? undefined;

  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');
  body.set('client_id', config.clientId);
  body.set('client_secret', config.clientSecret);
  if (scope) body.set('scope', scope);

  let response;
  try {
    response = await fetch(environment.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch (err: any) {
    throw new TokenServiceError(`Unable to reach token endpoint: ${err.message}`, 502);
  }

  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    throw new TokenServiceError('Token endpoint returned an error', 401, json);
  }
  if (!json.access_token) {
    throw new TokenServiceError('Token endpoint response did not contain an access_token', 502, json);
  }

  const expiresInSeconds = Number(json.expires_in ?? 300);
  const cachedToken: CachedToken = {
    accessToken: json.access_token,
    expiresAt: now + expiresInSeconds * 1000,
  };
  tokenCache.set(key, cachedToken);
  return cachedToken.accessToken;
}

export async function getScimBaseUrl(applicationId: number, environmentId: number): Promise<string> {
  const config = getConfigByAppAndEnv(applicationId, environmentId);
  if (!config) {
    throw new TokenServiceError(
      'No configuration (client id/secret/SCIM base URL) found for this application and environment',
      400
    );
  }
  return config.scimBaseUrl;
}
