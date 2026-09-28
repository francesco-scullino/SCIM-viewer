import { Router } from 'express';
import {
  createEnvironment,
  deleteEnvironment,
  getEnvironment,
  listEnvironments,
  updateEnvironment,
} from '../db/environmentsRepo';

export const environmentsRouter = Router();

environmentsRouter.get('/', (_req, res) => {
  res.json(listEnvironments());
});

environmentsRouter.get('/:id', (req, res) => {
  const env = getEnvironment(Number(req.params.id));
  if (!env) return res.status(404).json({ error: 'Environment not found' });
  res.json(env);
});

environmentsRouter.post('/', (req, res) => {
  const { name, tokenEndpoint, scope } = req.body ?? {};
  if (!name || !tokenEndpoint) {
    return res.status(400).json({ error: 'name and tokenEndpoint are required' });
  }
  try {
    const env = createEnvironment({ name, tokenEndpoint, scope });
    res.status(201).json(env);
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'An environment with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create environment' });
  }
});

environmentsRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, tokenEndpoint, scope } = req.body ?? {};
  if (!name || !tokenEndpoint) {
    return res.status(400).json({ error: 'name and tokenEndpoint are required' });
  }
  if (!getEnvironment(id)) return res.status(404).json({ error: 'Environment not found' });
  try {
    const env = updateEnvironment(id, { name, tokenEndpoint, scope });
    res.json(env);
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'An environment with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update environment' });
  }
});

environmentsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!getEnvironment(id)) return res.status(404).json({ error: 'Environment not found' });
  deleteEnvironment(id);
  res.status(204).send();
});
