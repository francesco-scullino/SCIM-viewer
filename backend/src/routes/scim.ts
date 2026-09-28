import { Router } from 'express';
import { scimDelete, scimGet, scimPatch, scimPost } from '../services/scimClient';

export const scimRouter = Router({ mergeParams: true });

function parseIds(req: any) {
  return {
    applicationId: Number(req.params.applicationId),
    environmentId: Number(req.params.environmentId),
  };
}

// --- Users ---

scimRouter.get('/:applicationId/:environmentId/users', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    const result = await scimGet(applicationId, environmentId, '/Users', query || undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

scimRouter.post('/:applicationId/:environmentId/users', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    const { userName, givenName, familyName, email, active } = req.body ?? {};
    if (!userName) return res.status(400).json({ error: 'userName is required' });

    const scimBody: Record<string, unknown> = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName,
      name: {
        givenName: givenName || undefined,
        familyName: familyName || undefined,
      },
      active: active ?? true,
    };
    if (email) {
      scimBody.emails = [{ value: email, primary: true }];
    }

    const result = await scimPost(applicationId, environmentId, '/Users', scimBody);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

scimRouter.delete('/:applicationId/:environmentId/users/:userId', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    await scimDelete(applicationId, environmentId, `/Users/${encodeURIComponent(req.params.userId)}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// --- Groups ---

scimRouter.get('/:applicationId/:environmentId/groups', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    const result = await scimGet(applicationId, environmentId, '/Groups', query || undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

scimRouter.post('/:applicationId/:environmentId/groups', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    const { displayName } = req.body ?? {};
    if (!displayName) return res.status(400).json({ error: 'displayName is required' });

    const scimBody = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      displayName,
    };
    const result = await scimPost(applicationId, environmentId, '/Groups', scimBody);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

scimRouter.delete('/:applicationId/:environmentId/groups/:groupId', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    await scimDelete(applicationId, environmentId, `/Groups/${encodeURIComponent(req.params.groupId)}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// --- Group membership (add/remove a user from a group) ---

scimRouter.patch('/:applicationId/:environmentId/groups/:groupId/members', async (req, res, next) => {
  try {
    const { applicationId, environmentId } = parseIds(req);
    const { op, userId } = req.body ?? {};
    if (!userId || (op !== 'add' && op !== 'remove')) {
      return res.status(400).json({ error: "userId is required and op must be 'add' or 'remove'" });
    }

    const operation =
      op === 'add'
        ? { op: 'add', path: 'members', value: [{ value: userId }] }
        : { op: 'remove', path: `members[value eq "${userId}"]` };

    const scimBody = {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
      Operations: [operation],
    };

    const result = await scimPatch(
      applicationId,
      environmentId,
      `/Groups/${encodeURIComponent(req.params.groupId)}`,
      scimBody
    );
    res.json(result ?? { success: true });
  } catch (err) {
    next(err);
  }
});
