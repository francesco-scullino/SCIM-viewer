import { app } from './app';
import './db'; // ensures schema is created on startup

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SCIM Viewer backend listening on http://localhost:${PORT}`);
});
