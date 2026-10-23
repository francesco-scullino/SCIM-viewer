# SCIM Viewer

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal IAM administrators and developers who inspect and administer users, groups, and group memberships across multiple applications and dev/pre/prod environments.

## Product Purpose

Provide one trusted web tool for administering users and groups through applications' SCIM APIs. Success means completing the intended operation against the selected application and environment and understanding any authentication or API failure.

## Positioning

A shared registry of environments and applications connects each application/environment pair to its own credentials and SCIM base URL. The backend obtains client-credentials tokens and proxies SCIM requests so the browser does not handle the client secret or call the identity provider directly.

## Operating Context

Intended for internal/local use on a trusted machine or network. Operators first configure an environment's token endpoint and optional default scope, register an application, and configure that application's credentials and SCIM URL per environment. They then select an active environment and application to work with users and groups.

The frontend is a React/TypeScript Vite SPA; the backend uses Node.js, TypeScript, Express, and local SQLite. Development runs the backend on port 4000 and the frontend on port 5173, with `/api` proxied to the backend.

## Capabilities and Constraints

- Manage environment and application registries and per-application/per-environment configurations.
- List and filter users and groups, create and delete them, and add or remove group members.
- Authenticate outbound requests through the identity provider's OAuth2 client-credentials token endpoint; cache tokens in backend memory until expiry.
- Keep client-secret handling in the backend. Secrets are stored in plaintext in the local SQLite database by explicit product decision.
- The app has no login of its own; preserve the trusted internal/local deployment model.
- An optional configuration scope overrides the environment's default scope.
- Show identity-provider and SCIM API failure details to the operator through notifications.

## Brand Commitments

Preserve the product name, SCIM Viewer, and established domain terms: Environments, Applications, Users, Groups, and Environment configurations.

## Evidence on Hand

`README.md` documents architecture, deployment assumptions, and setup workflows. `frontend/src/` contains the implemented operator interface and API clients; `backend/src/` contains the registry, token, and SCIM proxy implementation. These are implementation evidence, not evidence for customer, adoption, or performance claims.

## Product Principles

- Keep the active application and environment explicit when administering identities.
- Preserve backend-only credential handling and the confirmed trusted deployment model.
- Support direct administration workflows across configured applications and environments.
- Surface actionable authentication and SCIM failure details.

## Open Decisions

No product-specific accessibility standard, additional audience, or external deployment requirement was established during init. Revisit these when requirements arise rather than inventing commitments.
