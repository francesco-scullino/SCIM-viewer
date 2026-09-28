import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { environmentsRouter } from './routes/environments';
import { applicationsRouter } from './routes/applications';
import { scimRouter } from './routes/scim';
import { ScimClientError } from './services/scimClient';
import { TokenServiceError } from './services/tokenService';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/environments', environmentsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/scim', scimRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handler: converts token/SCIM errors into JSON responses
// with the upstream status code and details, so the frontend can display
// meaningful messages about OIDC or SCIM failures.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof TokenServiceError || err instanceof ScimClientError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
