# Constitution: Spec-Driven Development (React + OpenAPI + TanStack + Zod)

## 1. Scope
This constitution governs all frontend work in this repository: UI features, routing, API integration,
data fetching/caching, error handling, validation, testing, and release safety.

## 2. Sources of Truth
1. The OpenAPI spec is the API contract.
2. UI behavior must be traceable to a written feature spec in `docs/specs/`.
3. Runtime validation (Zod) is the boundary that determines what data the app accepts.

## 3. Non-Negotiable Laws

### 3.1 API access is centralized
- All API calls must go through `src/api/client.ts` using `openapi-fetch`.
- Components must never call the API directly.
- No `fetch`/`axios` outside the API layer.

### 3.2 No unvalidated external data
- All API responses must be validated with Zod before being returned from query/mutation functions.
- Validation occurs once at the boundary (API/query layer), never inside components.
- Validation failures become a normalized `AppError(kind="Validation")`.

### 3.3 TanStack Query owns server state
- All server state is managed via TanStack Query.
- Query keys are centralized and deterministic (`src/lib/queryKeys.ts`).
- Each endpoint used by the UI has a single canonical hook (e.g. `useUserQuery`, `useUpdateUserMutation`).

### 3.4 Deterministic UI states
Every data-driven screen must explicitly handle:
- Loading
- Error (user-safe message)
- Empty (when applicable)
- Success
No silent failures and no blank screens.

### 3.5 One error model
All failures are normalized into `AppError` with:
- kind (Network/Unauthorized/Forbidden/NotFound/RateLimited/Server/Validation/Unknown)
- status (if available)
- endpoint
- safe details (never raw secrets)

### 3.6 Contract deviations are tracked
If the API behavior differs from OpenAPI:
- Record it in `docs/contract-deviations.md`
- Isolate workarounds in `src/api/adapters/`
- Add a ticket to reconcile spec vs implementation
- Add a test that captures the deviation until removed

## 4. Required Repo Conventions

### 4.1 File layout (minimum)
- `src/api/` client, errors, validate, schemas, adapters
- `src/lib/queryKeys.ts`
- `src/features/<feature>/queries.ts` for hooks
- `docs/specs/` for feature specs

### 4.2 Feature work requires a spec
No feature work is merged without a spec using `docs/spec-template.md`.

## 5. Definition of Done
A change is only "done" if it satisfies `docs/definition-of-done.md`.

## 6. Governance
- Changes to this constitution require a PR that updates this file and explains the reason.
- Exceptions must be time-boxed and documented in the PR description.