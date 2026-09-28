import { db, touchUpdatedAt } from './index';
import { AppEnvironmentConfig, AppEnvironmentConfigWithNames } from '../types';

export function listConfigsForApplication(applicationId: number): AppEnvironmentConfigWithNames[] {
  return db
    .prepare(
      `SELECT c.*, a.name AS applicationName, e.name AS environmentName
       FROM app_environment_configs c
       JOIN applications a ON a.id = c.applicationId
       JOIN environments e ON e.id = c.environmentId
       WHERE c.applicationId = ?
       ORDER BY e.name`
    )
    .all(applicationId) as AppEnvironmentConfigWithNames[];
}

export function getConfig(id: number): AppEnvironmentConfig | undefined {
  return db.prepare('SELECT * FROM app_environment_configs WHERE id = ?').get(id) as
    | AppEnvironmentConfig
    | undefined;
}

export function getConfigByAppAndEnv(
  applicationId: number,
  environmentId: number
): AppEnvironmentConfig | undefined {
  return db
    .prepare('SELECT * FROM app_environment_configs WHERE applicationId = ? AND environmentId = ?')
    .get(applicationId, environmentId) as AppEnvironmentConfig | undefined;
}

export function createConfig(input: {
  applicationId: number;
  environmentId: number;
  clientId: string;
  clientSecret: string;
  scimBaseUrl: string;
  scope?: string | null;
}): AppEnvironmentConfig {
  const result = db
    .prepare(
      `INSERT INTO app_environment_configs
        (applicationId, environmentId, clientId, clientSecret, scimBaseUrl, scope)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.applicationId,
      input.environmentId,
      input.clientId,
      input.clientSecret,
      input.scimBaseUrl,
      input.scope ?? null
    );
  return getConfig(Number(result.lastInsertRowid))!;
}

export function updateConfig(
  id: number,
  input: { clientId: string; clientSecret: string; scimBaseUrl: string; scope?: string | null }
): AppEnvironmentConfig | undefined {
  db.prepare(
    `UPDATE app_environment_configs
     SET clientId = ?, clientSecret = ?, scimBaseUrl = ?, scope = ?
     WHERE id = ?`
  ).run(input.clientId, input.clientSecret, input.scimBaseUrl, input.scope ?? null, id);
  touchUpdatedAt('app_environment_configs', id);
  return getConfig(id);
}

export function deleteConfig(id: number): boolean {
  const result = db.prepare('DELETE FROM app_environment_configs WHERE id = ?').run(id);
  return result.changes > 0;
}
