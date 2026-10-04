# 01 - Database Schema & API Infrastructure Setup

> Implementation plan. Source: [RecSquad – Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §6 (Data Models) & §7 (API Endpoints) and [AGENTS.md](../AGENTS.md) §Core Domain Rules.

## Metadata

| Field                | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| **Feature ID**       | F01                                                              |
| **Section**          | Project Foundation - Data & API Infrastructure                   |
| **Severity**         | BLOCKER                                                          |
| **Markets**          | Single-market MVP (local recreational sports communities)        |
| **Status (today)**   | MISSING                                                          |
| **Estimated effort** | M (2–4w)                                                         |
| **Owner (proposed)** | Dev 1 - Auth & Group Core (Lead Engineer: Spencer)               |
| **Depends on**       | None - root node of the MVP dependency graph                     |
| **Unblocks**         | F02, F03, F04, F05, F06, F07, F08, F09, F10                      |

---

## 1. Problem Statement

The repository today contains specifications and planning documents only - there is no database, no Mongoose models, and no Express application skeleton. Because every other MVP feature (registration, profiles, groups, events, scorekeeping, leaderboards) depends on a shared data layer and a common request/response contract, the entire team is blocked from producing parallel work.

Without this foundation, each developer would invent their own collection shapes, error formats, GeoJSON conventions, and role checks, producing incompatible APIs that cannot be integrated. Delivering a canonical schema plus a running API scaffold with shared middleware enables the "API-Contract First" workflow the specification mandates (§9) and lets all feature teams (F02–F10) build in parallel against mock or live endpoints.

## 2. Goals

* **G-1:** Define, version, and migrate the five core MongoDB collections - `users`, `community_groups`, `events`, `event_rsvps`, and `match_scores` - exactly matching Specification §6 and `AGENTS.md`.
* **G-2:** Stand up an Express 5 application skeleton (config, router tree, middleware stack, error handling, health check) that feature teams mount their routes onto.
* **G-3:** Establish the GeoJSON `Point` convention (`[longitude, latitude]`) with `2dsphere` indexes so location/map features work correctly from day one.
* **G-4:** Provide shared cross-cutting middleware - request validation, RBAC (`requireAuth` / `requireRole`), a consistent error envelope, request logging, and rate limiting.
* **G-5:** Ship reproducible database **migration** and **seed** scripts plus a published OpenAPI contract and `.env.example`, so a new developer can boot the stack locally in one command.

## 3. Non-Goals

* **Feature endpoints:** This work defines the router *mount points* and shared middleware only. The actual auth flows (F02), profile editor (F03), group CRUD (F04), discovery/search (F05), scheduling (F06), RSVP/sub engine (F07), scorecard (F08), leaderboards (F09), and analytics (F10) are implemented under their own plans.
* **Real-time & offline:** Socket.io live scoring and Service Worker + IndexedDB offline sync are advanced features delivered by F08; only the reserved namespace and the `offline_sync_id` field are prepared here.
* **Maps & geocoding:** Google Maps JavaScript API integration, map pins, and distance-radius UI are out of scope (F05 / Explorer view).
* **Production deployment & CI/CD:** Containerization, cloud provisioning, and full pipelines are not part of the foundation deliverable beyond a lint/test script.
* **Analytics algorithms:** Leaderboard ranking math and Chart.js/Recharts dashboards are deferred to F09/F10.
* **Final auth transport decision:** The choice between JWT and session cookies is finalized in F02; F01 only provides the middleware seam.

## 4. Personas & User Stories

### Developer / Feature-Team Member (primary)

> **As a developer on the RecSquad team**, I want a documented schema and a running API skeleton with shared middleware so that I can build my feature against a stable contract without waiting on other teams.

### Community Organizer (indirect)

> **As a community organizer**, I want the system to store my group's location and events reliably so that players can find and join my games.

### Casual Player / Student (indirect)

> **As a casual player**, I want my account, sport preferences, and match history to be saved consistently so that the app remembers me across sessions.

### System Administrator (indirect)

> **As an administrator**, I want roles and permissions enforced at the API layer so that players cannot modify or delete groups they do not own.

### Self-Learner / Free Agent (indirect)

> **As a free agent**, I want the platform's data model to support substitute requests and flexible per-sport scorecards so that I can join last-minute and have my scores recorded correctly.

---

## 5. Functional Requirements

Requirements use RFC 2119 terminology: **MUST**, **SHOULD**, and **MAY**.

### Data Layer - Schemas & Collections

**FR-1:** The system MUST define Mongoose schemas for the `users`, `community_groups`, `events`, `event_rsvps`, and `match_scores` collections matching Specification §6 and `AGENTS.md`.

**FR-2:** The `users` schema MUST store `name`, `email`, `password_hash`, `role`, `preferred_sports`, and an optional GeoJSON `location`, and MUST add `createdAt`/`updatedAt` timestamps.

**FR-3:** `users.email` MUST be unique and indexed, and MUST be stored lower-cased and trimmed.

**FR-4:** `users.role` MUST be an enum of `ADMIN`, `ORGANIZER`, or `PLAYER` and MUST default to `PLAYER`.

**FR-5:** `users.preferred_sports` MUST be an array restricted to the enum `DISC_GOLF`, `PING_PONG`, `PICKLEBALL`, `SPIKEBALL`, or `OTHER`.

**FR-6:** The `community_groups` schema MUST store `name`, `sport_type`, `description`, `location_name`, GeoJSON `coordinates`, and `owner_id`, where `owner_id` references `users._id`.

**FR-7:** `community_groups.sport_type` MUST be an enum of `DISC_GOLF`, `PING_PONG`, `PICKLEBALL`, `SPIKEBALL`, or `OTHER`.

**FR-8:** The `events` schema MUST store `group_id`, `title`, `event_type`, `start_time`, `max_players`, and `venue_address`, where `group_id` references `community_groups._id`.

**FR-9:** `events.event_type` MUST be an enum of `PICKUP`, `LEAGUE_MATCH`, or `TOURNAMENT`.

**FR-10:** The system MUST provide an `event_rsvps` collection capturing one RSVP per `(event_id, user_id)` pair with a `status` enum of `ATTENDING`, `DECLINED`, or `SUB_REQUEST`.

**FR-11:** The `match_scores` schema MUST store `event_id`, a `players` array of user references, a flexible `score_data` object, a `status` enum of `IN_PROGRESS` or `COMPLETED`, and an optional `offline_sync_id`.

**FR-12:** `match_scores.score_data` MUST be a schemaless JSON object so sport-specific scorecards (hole-by-hole vs. sets/games) are supported without a migration per sport.

**FR-13:** `match_scores.offline_sync_id` MUST have a unique, sparse index so that PWA offline replays are idempotent.

**FR-14:** The system MUST store every geographic field as a valid GeoJSON `Point` whose `coordinates` array is `[longitude, latitude]` (longitude first), per `AGENTS.md`.

**FR-15:** The system MUST create a `2dsphere` index on each GeoJSON field (`users.location`, `community_groups.coordinates`).

### Data Layer - Migrations & Seed

**FR-16:** The repository MUST provide versioned, idempotent migration scripts that create collections, validators, and indexes reproducibly from an empty database.

**FR-17:** The repository MUST provide a seed script that loads representative demo users, groups, events, and matches for local development and testing.

**FR-18:** Migration and seed commands MUST be runnable via documented package scripts (e.g. `pnpm run migrate`, `pnpm run seed`).

### API Infrastructure

**FR-19:** The system MUST provide an Express 5 application with a versioned router mounted at `/api/v1`.

**FR-20:** The system MUST expose `GET /api/health` returning HTTP 200 with database connectivity status, service version, and uptime.

**FR-21:** The application MUST load configuration exclusively from environment variables (validated at boot) and MUST NOT hard-code secrets, connection strings, or ports.

**FR-22:** The system MUST return a single JSON error envelope for all error responses (see §9).

**FR-23:** The system MUST provide RBAC middleware exposing `requireAuth` and `requireRole(...roles)` so routes can be restricted to `ADMIN`, `ORGANIZER`, and/or `PLAYER`.

**FR-24:** The system MUST provide request-body and query-string validation middleware that rejects malformed input with `422` and field-level messages.

**FR-25:** The system MUST provide a machine-readable OpenAPI 3.1 document describing the base routes and shared schemas (API-Contract-First requirement, Specification §9).

**FR-26:** The system SHOULD emit structured request/access logs including a correlation/request ID per request.

**FR-27:** The system SHOULD apply baseline rate limiting to the API surface.

**FR-28:** The system SHOULD apply baseline security headers (e.g. `helmet`) and a CORS allow-list driven by configuration.

**FR-29:** The system MAY expose the OpenAPI document through an interactive Swagger UI in non-production environments.

---

## 6. Non-Functional Requirements

### Performance

* The `GET /api/health` endpoint MUST respond with **p95 < 50 ms** and MUST NOT become a bottleneck for container liveness probes.
* All list/query endpoints mounted on the skeleton MUST be backed by appropriate indexes; foundational queries MUST NOT perform collection scans.
* The primary group lookup SHOULD be supported by a compound index, and geospatial queries MUST use `2dsphere` indexes.

### Security

* Passwords MUST be stored only as salted hashes (bcrypt, cost factor ≥ 10); plaintext passwords MUST never be logged or persisted.
* Secrets (`JWT_SECRET`, `MONGO_URI`) MUST be supplied via environment and MUST be excluded from version control via `.gitignore`; a `.env.example` MUST document required keys.
* The API MUST send baseline security headers and MUST restrict cross-origin requests to configured origins.
* Authorization MUST be enforced server-side via RBAC middleware; client-side visibility checks MUST NOT be the sole control.
* MongoDB MUST use a least-privilege database user; production connection strings MUST enable TLS.

### Privacy & Compliance

* Only the minimum PII required (name, email, hashed password, coarse location) MUST be stored, and fields MUST be documented in a data dictionary.
* The base schema MUST support future data-subject export/erasure (FERPA/GDPR-style) by keeping user data addressable by `user_id`.
* The system SHOULD NOT expose raw user location to other users unless a product feature explicitly requires it.

### Accessibility

* No end-user UI ships in F01, so WCAG 2.1 AA conformance is **N/A** for this feature; however, the scaffold MUST NOT preclude later conformance, and any developer/health page added MUST meet AA.

### Scalability

* The data model MUST use collections that scale horizontally and MUST avoid unbounded embedded arrays (RSVPs and match players are separate/indexed, not inline growth vectors).
* The schema MUST be compatible with MongoDB replica sets and future sharding (e.g. by `group_id`/market where relevant).
* Cursor-based pagination MUST be the default contract for list endpoints.

### Reliability

* Migration and seed scripts MUST be **idempotent** and safe to re-run.
* The application MUST fail fast at boot if required configuration is missing or the database is unreachable, and MUST shut down gracefully on `SIGTERM`.
* Write operations exposed on the skeleton MUST be idempotent where a client retry is possible (guarded by `offline_sync_id`).

### Observability

* The app MUST emit structured logs with `timestamp`, `level`, `requestId`, `method`, `path`, `status`, and `durationMs`.
* The health endpoint MUST be usable as a readiness/liveness probe; a `/api/health/ready` variant MAY be added for DB-gated readiness.
* Errors MUST be logged with stack traces server-side while returning sanitized messages to clients.

### Maintainability

* Code MUST follow the repo's Node ESM + Express conventions (as demonstrated in `Tic-Tac-Toe/Server`): ES modules, `node --watch --env-file` for dev, and `pnpm` as the package manager.
* Schemas, models, middleware, and routes MUST live in clearly separated modules under `server/src/`.
* Linting/formatting MUST run in CI, and PRs require at least one approval (Specification §9).

### Internationalization

* All timestamps MUST be stored in UTC and exchanged as ISO-8601 strings.
* The schema MUST NOT assume a single locale; user-facing strings are externalized when UI is added (F03+).

### Backward Compatibility

* Schema changes MUST be additive migrations; destructive changes require a documented deprecation window.
* The API MUST be versioned (`/api/v1`); breaking changes introduce a new version rather than mutating v1.

---

## 7. Acceptance Criteria

- **AC-1.** *Given* a fresh clone with a running MongoDB, *When* the developer runs `pnpm install && pnpm run migrate && pnpm run seed`, *Then* all five collections exist with their indexes and seed data is present.
- **AC-2.** *Given* a migrated database, *When* the geospatial indexes are inspected, *Then* `users.location` and `community_groups.coordinates` each have a `2dsphere` index and store `[longitude, latitude]`.
- **AC-3.** *Given* two users with the same email, *When* the second is inserted, *Then* the write fails with a duplicate-key validation error.
- **AC-4.** *Given* a new user document without a `role`, *When* it is created, *Then* `role` defaults to `PLAYER`.
- **AC-5.** *Given* a `match_scores` document with a duplicate `offline_sync_id`, *When* a replay is inserted, *Then* the operation is rejected/ignored idempotently.
- **AC-6.** *Given* the server is running, *When* a client calls `GET /api/health`, *Then* it receives `200` with `{ status, db, version, uptime }`.
- **AC-7.** *Given* a request with a missing or invalid required field, *When* it hits a validated route, *Then* the API returns `422` with a field-level error envelope.
- **AC-8.** *Given* an authenticated `PLAYER`, *When* they call a route guarded by `requireRole('ORGANIZER','ADMIN')`, *Then* the API returns `403` and the attempt is logged.
- **AC-9.** *Given* the OpenAPI document, *When* it is validated by an OpenAPI 3.1 linter, *Then* it passes with no errors.
- **AC-10.** *Given* the application boots without `MONGO_URI` set, *When* it starts, *Then* it exits non-zero with a clear configuration error.
- **AC-11.** *Given* the app receives `SIGTERM`, *When* the signal is handled, *Then* it stops accepting connections and closes the database connection before exiting `0`.

---

## 8. Data Model

All identifiers are MongoDB `ObjectId`. All collections include `createdAt` and `updatedAt` timestamps. Geographic fields use GeoJSON `Point` with `[longitude, latitude]` ordering.

### Collection: `users`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `name` | String | Required, trimmed |
| `email` | String | Required, **unique index**, lower-cased, trimmed |
| `password_hash` | String | Required, `select: false` by default |
| `role` | String enum | `ADMIN` \| `ORGANIZER` \| `PLAYER`, default `PLAYER` |
| `preferred_sports` | String[] | `DISC_GOLF` \| `PING_PONG` \| `PICKLEBALL` \| `SPIKEBALL` \| `OTHER` |
| `location` | GeoJSON Point | Optional; `coordinates: [lng, lat]`; **`2dsphere` index** |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** `{ email: 1 }` (unique); `{ location: '2dsphere' }`; `{ preferred_sports: 1 }`.

### Collection: `community_groups`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `name` | String | Required |
| `sport_type` | String enum | `DISC_GOLF` \| `PING_PONG` \| `PICKLEBALL` \| `SPIKEBALL` \| `OTHER` |
| `description` | String | Group guidelines / overview |
| `location_name` | String | Venue / park name |
| `coordinates` | GeoJSON Point | `[lng, lat]`; **`2dsphere` index** |
| `owner_id` | ObjectId ref | References `User`; creator becomes `ORGANIZER` |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** `{ sport_type: 1, coordinates: '2dsphere' }`; `{ owner_id: 1 }`; `{ name: 'text' }` (search).

### Collection: `events`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `group_id` | ObjectId ref | References `CommunityGroup`; required, indexed |
| `title` | String | Required |
| `event_type` | String enum | `PICKUP` \| `LEAGUE_MATCH` \| `TOURNAMENT` |
| `start_time` | Date | Required, UTC |
| `max_players` | Integer | ≥ 1, registration cap |
| `venue_address` | String | Full address |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** `{ group_id: 1, start_time: 1 }` (schedule lookups); `{ start_time: 1 }` (upcoming-events feed).

### Collection: `event_rsvps`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `event_id` | ObjectId ref | References `Event`; required |
| `user_id` | ObjectId ref | References `User`; required |
| `status` | String enum | `ATTENDING` \| `DECLINED` \| `SUB_REQUEST` |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** `{ event_id: 1, user_id: 1 }` (**unique** - one RSVP per player per event); `{ event_id: 1, status: 1 }` (capacity counts).

### Collection: `match_scores`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `event_id` | ObjectId ref | References `Event`; required |
| `players` | ObjectId[] | References `User`; participating players |
| `score_data` | Mixed | Sport-specific, e.g. `{ hole_1: 3 }` or `{ set_1: "11-9" }` |
| `status` | String enum | `IN_PROGRESS` \| `COMPLETED` |
| `offline_sync_id` | String | Optional; **unique sparse index** for PWA idempotency |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** `{ event_id: 1 }`; `{ offline_sync_id: 1 }` (unique sparse); `{ players: 1 }` (player history).

### Enums (single source of truth)

Enums are centralized in `server/src/models/enums.js` and reused by schema validation, request validation, and the OpenAPI document: `ROLE`, `SPORT_TYPE`, `EVENT_TYPE`, `RSVP_STATUS`, `MATCH_STATUS`.

### Migrations & Naming Convention

* Migration tooling: `migrate-mongo` (or equivalent), configured in `server/migrate-mongo-config.js`.
* Naming convention: `server/migrations/YYYYMMDDHHMMSS_short-description.js`. The template's `server/migrations/NNN_*.sql` example is adapted here because this project uses MongoDB + Mongoose rather than SQL.
* Migrations are **forward-only** and idempotent; each creates the collection validator and its indexes.
* **Backfill:** Not applicable - greenfield project; the initial migration creates empty collections.

---

## 9. API Surface

All routes are mounted under `/api/v1`. F01 defines the skeleton; feature teams add resource routes beneath the same routers.

### Base / Infrastructure Routes

| Method | Path | Auth scope | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | Public | Liveness + DB connectivity + version |
| `GET` | `/api/v1/health/ready` | Public | Readiness (DB-gated) |
| `GET` | `/api/v1/openapi.json` | Public (non-prod) | OpenAPI 3.1 document |
| `GET` | `/docs` | Public (non-prod) | Swagger UI |

### Reserved Mount Points (implemented by later features)

| Mount | Owner feature(s) |
| --- | --- |
| `/api/v1/auth/*` | F02 |
| `/api/v1/users/*` | F02, F03, F10 |
| `/api/v1/groups/*` | F04, F05, F06, F09 |
| `/api/v1/events/*` | F06, F07, F08 |
| `/api/v1/matches/*` | F08 |

### Shared Response Shapes (pseudo-TypeScript)

```typescript
type ApiError = {
  error: {
    code: string;          // e.g. "VALIDATION_ERROR"
    message: string;       // human-readable, sanitized
    requestId: string;     // correlation id
    details?: { field: string; message: string }[];
  };
};

type HealthResponse = {
  status: 'ok' | 'degraded';
  db: 'connected' | 'disconnected';
  version: string;         // git sha / semver
  uptime: number;          // seconds
};
```

### Error Codes

`VALIDATION_ERROR` (422) · `UNAUTHENTICATED` (401) · `FORBIDDEN` (403) · `NOT_FOUND` (404) · `CONFLICT` (409) · `RATE_LIMITED` (429) · `INTERNAL_ERROR` (500).

### WebSocket Events

Not implemented in F01. The Socket.io namespace (e.g. `/matches`) is **reserved** here and delivered by F08; the schema's `offline_sync_id` prepares for its PWA reconciliation.

### Rate-Limit / Quota

A baseline limit of **100 requests / 15 min / IP** applied to `/api/v1`; stricter limits are added for auth routes in F02.

### OpenAPI Documentation

An OpenAPI 3.1 document MUST be maintained and MUST cover every base route and shared schema; CI MUST lint it.

---

## 10. UI / UX

This feature is infrastructure-only and ships **no end-user UI**. It does, however, deliver the developer-facing surfaces below so the stack is observable and testable.

* **Developer/health surface** (optional, non-prod): a minimal `/docs` Swagger UI and a JSON `/api/v1/health` view for smoke testing.
* **No end-user pages, flows, or components** are added; therefore empty/loading/error/offline states, mobile/responsive behavior, focus order, ARIA annotations, and i18n copy keys are **N/A** for F01 and are addressed by F02–F10.
* Any developer page added MUST still meet WCAG 2.1 AA (semantic HTML, labelled controls).

---

## 11. AI / ML Considerations

Not applicable - F01 introduces no models, prompts, or inference, and processes no AI-specific data. Any AI-touching features are handled in later plans.

---

## 12. Integration Points

### External Services / APIs

* **MongoDB** (local via Docker, or MongoDB Atlas; server ≥ 6.0) - primary datastore, accessed through Mongoose 8.x.
* **npm registry** - dependencies installed with `pnpm@10.x`: `express@^5`, `mongoose`, `dotenv`, `zod` (validation), `helmet`, `cors`, `express-rate-limit`, `jsonwebtoken`, `bcrypt`, `pino`/`morgan` (logging), `migrate-mongo`, `swagger-ui-express`.

### Internal Modules Touched (proposed layout)

```text
server/
├── src/
│   ├── index.js            # bootstrap + graceful shutdown
│   ├── app.js              # express app + middleware stack
│   ├── config/index.js     # env loading + validation
│   ├── db/connect.js       # mongoose connection
│   ├── models/             # User, CommunityGroup, Event, EventRsvp, MatchScore, enums.js
│   ├── middleware/         # errorHandler, validate, requireAuth, requireRole, requestLogger, rateLimit
│   ├── routes/             # v1 router tree + health.js
│   └── openapi/            # openapi.js / spec.yaml
├── migrations/             # YYYYMMDDHHMMSS_*.js
├── scripts/seed.js
├── .env.example
└── package.json
```

> Note: the template's example paths (`server/internal/...`, `clients/web/src/...`) are illustrative. This Node.js project uses `server/src/...`; the React mobile-first client lives under `clients/web/` in a later feature, and `Tic-Tac-Toe/Server` is the in-repo Express reference for conventions.

### Webhook / Event Emissions

None in F01. Domain events for leaderboard recalculation are introduced in F08/F09.

---

## 13. Dependencies & Sequencing

* **Must ship after:** None - F01 is the root of the dependency graph.
* **Must ship before:** F02, F03, F04, F05, F06, F07, F08, F09, F10 (all MVP features).
* **Shared infra needed:** a running MongoDB instance (local Docker or Atlas free tier); Node.js LTS + `pnpm@10.x`; environment secrets (`MONGO_URI`, `JWT_SECRET`).
* **Recommended sequence:** `config → db connect → models → migrations → middleware → router/health → seed → OpenAPI → tests`.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Mongo/Postgres stack indecision reopens the schema | M | H | Lock MongoDB + Mongoose for the MVP (AGENTS.md primary); record the PostgreSQL + Prisma alternative as Open Question #1 and keep enums centralized so a future port is mechanical. |
| GeoJSON `[lng, lat]` transposition bugs | H | H | Enforce longitude-first in schema validation + unit tests; never accept `[lat, lng]`; document the rule in §8 and AGENTS.md. |
| Teams build features before the contract is frozen | M | H | Publish OpenAPI + enums early; hold an "API Contract First" review before F02 starts. |
| Missing indexes cause slow queries at scale | M | M | Define indexes in the initial migration and add a test asserting the required indexes exist. |
| Secrets committed to the repo | M | H | Ship `.env.example` only; `.gitignore` excludes `.env`; add a CI secret scan. |
| `offline_sync_id` collisions corrupt offline replays | L | M | Unique sparse index + idempotent upsert in F08; covered by AC-5. |
| Schema churn forces rework of dependent plans | M | M | Additive-only migrations, versioned API, and schema reviews with all feature owners. |

---

## 15. Rollout Plan

* **Feature flag:** None required - F01 is foundational infrastructure, not user-facing behavior.
* **Migration sequencing:** create `config + db connect` → run the initial migration (collections, validators, indexes) → deploy scaffold code → run `seed` (dev/test only) → verify health + OpenAPI.
* **Dogfood / pilot:** the development team uses the scaffold as the base branch for F02–F10; a smoke test runs in CI on every PR.
* **GA criteria:** all ACs pass; OpenAPI lints clean; a new developer can boot the stack and seed data with one documented command; F02 can mount `/auth` without modifying F01 code.
* **Comms:** announce the frozen schema/contract and mount points to the team before feature work begins.
* **Rollback path:** revert the scaffold branch and recreate the development database; because migrations are forward-only and the app is pre-GA, recovery is a corrected migration rather than a down-migration.

---

## 16. Test Plan

* **Unit** - Mongoose model validators (enum rejection, required fields, email normalization, GeoJSON `[lng, lat]` shape); `requireRole` RBAC logic; error-envelope serialization; config validation.
* **Integration** - database connectivity against `mongodb-memory-server`; migration idempotency (run twice); seed script; health endpoint returns DB status; unique-index enforcement (email, RSVP pair, `offline_sync_id`).
* **End-to-end (Playwright)** - Smoke: boot app, hit `/api/v1/health`, confirm `200` + payload. Edge: missing config → non-zero exit; `SIGTERM` → graceful shutdown.
* **Security** - Authz matrix for `requireRole` across `PLAYER`/`ORGANIZER`/`ADMIN`; verify `password_hash` is never returned by default queries; OWASP-relevant checks (security headers, CORS allow-list, rate-limit activation, no stack traces in responses).
* **Accessibility** - N/A for end-user UI; if a developer/health page ships, run axe and assert no violations.
* **Performance / load** - assert required indexes exist; run k6/autocannon smoke against `/api/v1/health` and a representative list query to confirm p95 targets.
* **Manual exploratory** - QA checklist: clone → install → migrate → seed → boot → health → OpenAPI/Swagger UI → mount a stub route → `SIGTERM`.

---

## 17. Documentation & Training

* **End-user docs** - none for F01.
* **Developer docs** - `server/README.md` runbook: prerequisites, `.env` setup, migrate/seed/boot commands, folder layout, and the contract-first workflow.
* **API reference** - OpenAPI 3.1 spec + Swagger UI covering base routes and shared schemas.
* **Internal runbook** - how to add a collection/migration; how to mount a new feature router; RBAC usage; index-change process.
* **CONTRIBUTING** - branch naming (`feature/dev1-...`), PR approval rule, and lint/test expectations (Specification §9).

---

## 18. Open Questions

1. **Database engine** - Confirm MongoDB + Mongoose as the MVP standard (assumed here) versus PostgreSQL + Prisma with GeoJSON; a decision owner is needed to ratify before F02.
2. **Feature-ID numbering** - The filename uses `F01` while the heading reads `01`, and the sibling plan `1.2` uses `1.1`; which numbering scheme is canonical for the plan set?
3. **Auth transport** - JWT bearer tokens versus HTTP-only session cookies (with refresh); decided in F02 but it shapes `requireAuth`. Owner: Dev 1.
4. **Repository layout** - Confirm a `server/` + `clients/web/` monorepo layout versus keeping app code in `Tic-Tac-Toe/`-style folders; where does the client live?
5. **OpenAPI authoring** - Hand-written spec versus generated from JSDoc/Zod (`zod-to-openapi`); pick a tool to keep docs in sync.
6. **MongoDB hosting** - Local Docker versus Atlas free tier for the team; affects connection strings and CI.
7. **Migration tool** - `migrate-mongo` versus custom Mongoose scripts; confirm team preference.

---

## 19. References

* **Existing files this work touches / creates:** `server/src/**` (new), `server/migrations/**` (new), `server/scripts/seed.js` (new), `server/.env.example` (new); in-repo Express reference: `Tic-Tac-Toe/Server/src/index.js`.
* **Specification:** `Project Specification/ReqSquad - Specifications Proposal.docx` §6 (Data Models), §7 (API Endpoints), §9 (Workflow / API-Contract-First).
* **Agent / architecture context:** `Project Specification/AGENTS.md` (stack, GeoJSON rule, RBAC, flexible match schema).
* **Related plans:** `F02-User_Registration_&_Authentication_System.md`, `F03-Player_Profile_&_Sport_Preference_Editor.md`, `F04-Community_Group_Creation_&_Management.md`, `F05-Feed_Based_Group_Discovery_&_Search.md`, `F06-Event_Scheduling_&_Capacity_Tracking.md`, `F07-Event_RSVP_&_Substitute_Request_System.md`, `F08-Mobile_Match_Scorecard_Entry.md`, `F09-Group_Leaderboard_&_Standings_Engine.md`, `F10-Player_Analytics_&_Match_History_Dashboard.md`; style reference: `1.2-Community_Feed.md`.
* **External standards:** GeoJSON (RFC 7946); OpenAPI 3.1; OWASP API Security Top 10; WCAG 2.1 AA (deferred to UI features).
