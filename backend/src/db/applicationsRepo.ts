import { db, touchUpdatedAt } from './index';
import { Application } from '../types';

export function listApplications(): Application[] {
  return db.prepare('SELECT * FROM applications ORDER BY name').all() as Application[];
}

export function getApplication(id: number): Application | undefined {
  return db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as Application | undefined;
}

export function createApplication(input: { name: string; description?: string | null }): Application {
  const result = db
    .prepare('INSERT INTO applications (name, description) VALUES (?, ?)')
    .run(input.name, input.description ?? null);
  return getApplication(Number(result.lastInsertRowid))!;
}

export function updateApplication(
  id: number,
  input: { name: string; description?: string | null }
): Application | undefined {
  db.prepare('UPDATE applications SET name = ?, description = ? WHERE id = ?').run(
    input.name,
    input.description ?? null,
    id
  );
  touchUpdatedAt('applications', id);
  return getApplication(id);
}

export function deleteApplication(id: number): boolean {
  const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
  return result.changes > 0;
}
