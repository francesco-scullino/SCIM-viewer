import { Router } from 'express';
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
} from '../db/applicationsRepo';
import {
  createConfig,
  deleteConfig,
  getConfig,
  listConfigsForApplication,
  updateConfig,
} from '../db/configsRepo';
import { clearCachedToken } from '../services/tokenService';

export const applicationsRouter = Router();

applicationsRouter.get('/', (_req, res) => {
  res.json(listApplications());
});

applicationsRouter.get('/:id', (req, res) => {
  const app = getApplication(Number(req.params.id));
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

applicationsRouter.post('/', (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const app = createApplication({ name, description });
    res.status(201).json(app);
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'An application with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create application' });
  }
});

applicationsRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!getApplication(id)) return res.status(404).json({ error: 'Application not found' });
  try {
    const app = updateApplication(id, { name, description });
    res.json(app);
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'An application with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update application' });
  }
});

applicationsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!getApplication(id)) return res.status(404).json({ error: 'Application not found' });
  deleteApplication(id);
  res.status(204).send();
});

// --- Per-environment configs (client id/secret/scim base url) for an application ---

applicationsRouter.get('/:id/configs', (req, res) => {
  const applicationId = Number(req.params.id);
  if (!getApplication(applicationId)) return res.status(404).json({ error: 'Application not found' });
  res.json(listConfigsForApplication(applicationId));
});

applicationsRouter.post('/:id/configs', (req, res) => {
  const applicationId = Number(req.params.id);
  if (!getApplication(applicationId)) return res.status(404).json({ error: 'Application not found' });
  const { environmentId, clientId, clientSecret, scimBaseUrl, scope } = req.body ?? {};
  if (!environmentId || !clientId || !clientSecret || !scimBaseUrl) {
    return res
      .status(400)
      .json({ error: 'environmentId, clientId, clientSecret and scimBaseUrl are required' });
  }
  try {
    const config = createConfig({
      applicationId,
      environmentId: Number(environmentId),
      clientId,
      clientSecret,
      scimBaseUrl,
      scope,
    });
    res.status(201).json(config);
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'A configuration for this application and environment already exists' });
    }
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

applicationsRouter.put('/:id/configs/:configId', (req, res) => {
  const applicationId = Number(req.params.id);
  const configId = Number(req.params.configId);
  if (!getApplication(applicationId)) return res.status(404).json({ error: 'Application not found' });
  const existing = getConfig(configId);
  if (!existing || existing.applicationId !== applicationId) {
    return res.status(404).json({ error: 'Configuration not found' });
  }
  const { clientId, clientSecret, scimBaseUrl, scope } = req.body ?? {};
  if (!clientId || !clientSecret || !scimBaseUrl) {
    return res.status(400).json({ error: 'clientId, clientSecret and scimBaseUrl are required' });
  }
  const config = updateConfig(configId, { clientId, clientSecret, scimBaseUrl, scope });
  clearCachedToken(applicationId, existing.environmentId);
  res.json(config);
});

applicationsRouter.delete('/:id/configs/:configId', (req, res) => {
  const applicationId = Number(req.params.id);
  const configId = Number(req.params.configId);
  const existing = getConfig(configId);
  if (!existing || existing.applicationId !== applicationId) {
    return res.status(404).json({ error: 'Configuration not found' });
  }
  deleteConfig(configId);
  clearCachedToken(applicationId, existing.environmentId);
  res.status(204).send();
});
