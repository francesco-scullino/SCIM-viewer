# SCIM Viewer

Web app to administer users and groups through the SCIM APIs of multiple applications,
across multiple environments (dev/pre/prod), authenticating against the Identity
Provider with the OpenID Connect **client-credentials** flow.

## Architecture

Since a client secret cannot be handled securely in a pure frontend (it would be
visible to anyone opening the browser), the app is made of two parts:

- **`backend/`** — Node.js + TypeScript + Express. Exposes REST APIs that:
  - manage the registry of Environments, Applications and the per
    application+environment Configurations (client id, client secret, SCIM base URL),
    stored in a local **SQLite** database (`backend/data/scim-viewer.db`);
  - obtain the OAuth2 client-credentials token from the Token Endpoint of the
    selected environment (cached in memory until expiry) and use it to proxy SCIM
    calls (Users/Groups) to the selected application.
- **`frontend/`** — React + TypeScript + Vite (SPA). Talks only to the backend
  (never directly to the IdP or the SCIM APIs) and lets you:
  - manage the **Environments** registry (name, OIDC Token Endpoint, default scope);
  - manage the **Applications** registry and, for each one, the per-environment
    configurations (client id, client secret, SCIM base URL, optional scope);
  - select the active **Environment + Application** and from there view/create/delete
    **users** and **groups**, and add/remove users from groups.

> Note: by explicit decision, client secrets are stored **in clear text** in the
> SQLite database and the app has no login of its own: it is intended for
> internal/local use on a trusted machine/network.

## Data model

- `environments`: `name`, `tokenEndpoint`, `scope` (default for the environment)
- `applications`: `name`, `description`
- `app_environment_configs` (per application+environment pair): `clientId`,
  `clientSecret`, `scimBaseUrl`, `scope` (optional, overrides the environment's scope)

## Requirements

- Node.js 18+ (verified with Node 20)

## Running in development

Backend (port 4000):

```powershell
cd backend
npm install
npm run dev
```

Frontend (port 5173, proxying `/api` calls to the backend):

```powershell
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Production build

```powershell
cd backend
npm run build
npm start        # starts dist/server.js on http://localhost:4000

cd ../frontend
npm run build     # generates frontend/dist, to be served with any static web
                   # server of your choice (proxying /api to the backend)
```

## Usage

1. Go to **Environments** and create at least one environment (e.g. `dev`)
   specifying the OIDC Token Endpoint of the relevant Identity Provider (and,
   optionally, a default scope).
2. Go to **Applications**, create an application and, via "Environment
   configurations", add for each environment where the application is reachable
   the client id, client secret and SCIM base URL to use.
3. On the **Users & Groups** page, select the environment and application you want
   to work with from the bar at the top: you can view, create and delete users and
   groups, and manage group membership.

Any OIDC authentication errors (e.g. unreachable token endpoint, wrong client
id/secret) or SCIM API call errors are shown as notifications (toasts) with the
detail returned by the IdP or the API.

## Project structure

```
scim-viewer/
  backend/
    src/
      db/            # SQLite schema + repositories (environments, applications, configs)
      routes/         # Express routes (environments, applications, scim)
      services/       # tokenService (OIDC client-credentials) and scimClient (SCIM proxy)
      app.ts, server.ts
  frontend/
    src/
      api/            # REST client for the backend
      components/     # Layout, Environment/Application selector, toast notifications
      pages/          # Environments, Applications, Users & Groups
      App.tsx, main.tsx
```
