import { db, touchUpdatedAt } from './index';
import { Environment } from '../types';

export function listEnvironments(): Environment[] {
  return db.prepare('SELECT * FROM environments ORDER BY name').all() as Environment[];
}

export function getEnvironment(id: number): Environment | undefined {
  return db.prepare('SELECT * FROM environments WHERE id = ?').get(id) as Environment | undefined;
}

export function createEnvironment(input: { name: string; tokenEndpoint: string; scope?: string | null }): Environment {
  const result = db
    .prepare('INSERT INTO environments (name, tokenEndpoint, scope) VALUES (?, ?, ?)')
    .run(input.name, input.tokenEndpoint, input.scope ?? null);
  return getEnvironment(Number(result.lastInsertRowid))!;
}

export function updateEnvironment(
  id: number,
  input: { name: string; tokenEndpoint: string; scope?: string | null }
): Environment | undefined {
  db.prepare('UPDATE environments SET name = ?, tokenEndpoint = ?, scope = ? WHERE id = ?').run(
    input.name,
    input.tokenEndpoint,
    input.scope ?? null,
    id
  );
  touchUpdatedAt('environments', id);
  return getEnvironment(id);
}

export function deleteEnvironment(id: number): boolean {
  const result = db.prepare('DELETE FROM environments WHERE id = ?').run(id);
  return result.changes > 0;
}
