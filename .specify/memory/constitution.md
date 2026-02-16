# TMDB Movie App Constitution
<!-- Spec-Driven Frontend Development for React + OpenAPI + TanStack Query + Zod -->

## Core Principles

### I. Spec-First Feature Development
Every feature must start with a written specification in `docs/specs/` before code is merged. UI behavior is always traceable to an approved feature spec. Specs use the `spec-template.md` format and are reviewed before implementation begins.

### II. OpenAPI as the Source of Truth
The OpenAPI specification is the authoritative API contract. All client-side expectations must align with the spec. When API behavior deviates from the OpenAPI definition, the deviation must be recorded in `docs/contract-deviations.md` with a reconciliation ticket. Workarounds are isolated in `src/api/adapters/`.

### III. Centralized API Access (NON-NEGOTIABLE)
All API calls must go through `src/api/client.ts` using `openapi-fetch`. Components must never call the API directly. No direct use of `fetch` or `axios` outside the API layer. Every endpoint used by the UI has a single canonical hook (e.g., `useMoviesQuery`, `useUpdateUserMutation`).

### IV. Runtime Validation at the Boundary
All API responses must be validated with Zod before returning from query/mutation functions. Validation occurs once at the boundary (API/query layer), never inside components. Validation failures are normalized as `AppError(kind="Validation")`. No unvalidated external data enters the application state.

### V. TanStack Query Centralized Server State Management
All server state is managed exclusively via TanStack Query. Query keys are centralized and deterministic in `src/lib/queryKeys.ts`. Data fetching, caching, synchronization, and invalidation are handled through TanStack Query hooks, never bypassed with manual state.

## UI State & Error Handling

### Deterministic UI States (Required)
Every data-driven screen must explicitly handle:
- **Loading**: Show a loading indicator or skeleton
- **Error**: Display a user-safe error message (never raw API text or secrets)
- **Empty**: When applicable, show an empty state with helpful guidance
- **Success**: Show the data with appropriate layout and interactions

No silent failures. No blank screens. Every network call has a visible state.

### One Error Model
All failures are normalized into `AppError` with:
- `kind`: Network | Unauthorized | Forbidden | NotFound | RateLimited | Server | Validation | Unknown
- `status`: HTTP status code if available
- `endpoint`: Which API endpoint failed
- `safeDetails`: User-friendly error message (never raw secrets or stack traces)

## Module Exports (TypeScript)

1) Default exports are forbidden.
- All exports MUST be named exports.
- This applies to components, hooks, utilities, schemas, and route modules.

Rationale: consistent imports, easier refactors, clearer symbols, fewer accidental renames.

Example:
```ts
export function UserPage() { ... }
export type UserPageProps = { ... }
```

## Required Repo Conventions

### File Layout (Minimum Structure)
- `src/api/`
  - `client.ts`: openapi-fetch client configuration
  - `errors.ts`: AppError class and utilities
  - `validate.ts`: Zod schema validation functions
  - `schemas.ts`: Zod schemas for all API response types
  - `adapters/`: Workarounds for API deviations from OpenAPI spec
- `src/lib/queryKeys.ts`: Centralized TanStack Query key factory
- `src/features/<feature>/queries.ts`: TanStack Query hooks for each feature
- `src/features/<feature>/components/`: React components using hooks
- `docs/specs/`: Feature specifications (one file per feature)
- `docs/contract-deviations.md`: Tracked API/spec mismatches

### Feature Work Requires a Spec
No feature work is merged without a spec using `docs/spec-template.md`. Specs are reviewed and approved before implementation. Specs document user stories, acceptance criteria, API usage, error cases, and test scenarios.

### Definition of Done
A change is only "done" if it satisfies `docs/definition-of-done.md`. Checklist requirements:
- ✓ Feature spec exists and is approved
- ✓ All API calls use centralized client
- ✓ All API responses validated with Zod
- ✓ All states (loading/error/empty/success) handled
- ✓ Errors normalized to AppError model
- ✓ TanStack Query hooks created and used
- ✓ Tests pass (unit and integration)
- ✓ No console errors or warnings

## Development Workflow

### Self-Review Checklist
Before committing code, verify:
1. **Spec Compliance**: Is there a feature spec? Does code match the spec?
2. **API Layer**: Are all API calls in `src/api/client.ts`? Are responses validated with Zod?
3. **State Management**: Are all server state calls going through TanStack Query?
4. **Error Handling**: Are all error cases handled and normalized to AppError?
5. **UI States**: Do components render loading/error/empty/success states?
6. **Contract Deviations**: If API differs from spec, is it documented in `contract-deviations.md`?
7. **Tests Pass**: Do unit and integration tests pass locally?
8. **No Console Errors**: Is the browser console clean?

### Handling Deviations from OpenAPI
If the API behavior differs from OpenAPI:
1. Record it in `docs/contract-deviations.md` with date and ticket number
2. Isolate the workaround in `src/api/adapters/`
3. Create a ticket to reconcile spec vs. implementation
4. Add a test that captures the deviation (tests remain until deviation is removed)

## Governance

### Amendment Process
When principles need to change:
1. Update this file with clear rationale for the change
2. Explain why the principle is being added, modified, or removed
3. Note any impact on existing code or workflows
4. If a breaking change, document migration steps

### Compliance Verification
- Self-review checklist guides implementation of each feature
- Use this constitution as reference for code quality standards
- Deviations from principles require written justification and a plan to reconcile

### Versioning Policy
Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward-incompatible principle removals or redefinitions (e.g., changing from TanStack Query to Redux)
- **MINOR**: New principle or substantial expansion of guidance (e.g., adding error handling rules)
- **PATCH**: Clarifications, wording improvements, typo fixes (no semantic changes)

### Runtime Development Guidance
For daily development guidance and patterns, refer to `docs/quickstart.md` and feature-specific docs in `docs/guides/`. This constitution is the governance layer; docs are the implementation layer.

---

**Version**: 1.1.0 | **Ratified**: 2026-02-16 | **Last Amended**: 2026-02-16

<!-- AMENDMENT LOG
1.1.0 (2026-02-16): Added Module Exports (TypeScript) principle requiring named exports only, no default exports. Rationale: consistent imports, easier refactors, clearer symbols, fewer accidental renames.

1.0.1 (2026-02-16): Adapted development workflow and governance for single-person project. Changed "Code Review Checklist" to "Self-Review Checklist", simplified amendment process, and streamlined compliance verification. No principles changed.
-->

