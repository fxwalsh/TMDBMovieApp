# Implementation Plan: Movie Discovery App

**Branch**: `001-movie-discovery` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-movie-discovery/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a React web application that allows users to discover and browse movies from TMDB API. Core features include paginated movie browsing, filtering by title and genre, detailed movie views, and favorites management with localStorage persistence. Technical approach: Vite + TypeScript + React + Material UI + TanStack Query + Zod validation + openapi-fetch client.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18.x  
**Build Tool**: Vite 5.x (fast dev server, optimized builds)  
**Primary Dependencies**:  
- `@mui/material` + `@mui/icons-material` (UI components and theming)
- `@tanstack/react-query` (server state management)
- `openapi-fetch` (type-safe API client)
- `zod` (runtime validation)
- `react-router-dom` (routing for Home, Details, Favorites pages)

**Storage**: localStorage (favorites persistence, client-side only)  
**Testing**: Vitest (unit tests), React Testing Library (component tests)  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (single-page frontend)  
**Performance Goals**: < 2 seconds page navigation, < 1 second filter response (with 500ms debounce)  
**Constraints**: Must handle TMDB API rate limits gracefully, localStorage availability required, no backend server (client-side only)  
**Scale/Scope**: Single feature (~4 pages), ~20-30 components, TMDB API integration (~3-4 endpoints)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Status | Evidence |
|-----------|-------------|----------|
| **I. Spec-First** | ✅ PASS | Feature spec exists at `specs/001-movie-discovery/spec.md`, clarified with 5 Q&A, ready for implementation |
| **II. OpenAPI Source of Truth** | ✅ PASS | OpenAPI spec exists at `/api/tmdb-api.json` (OpenAPI 3.1.0). Types will be generated using `openapi-typescript`, consumed via `openapi-fetch`. Zod schemas wrap generated types for runtime validation. |
| **III. Centralized API Access** | ✅ PASS | Architecture includes `src/api/client.ts` with openapi-fetch, all queries go through TanStack Query hooks in `features/*/queries.ts` |
| **IV. Runtime Validation** | ✅ PASS | Zod schemas planned in `src/api/schemas.ts`, validation in `src/api/validate.ts`, all API responses validated before returning from queries |
| **V. TanStack Query** | ✅ PASS | `@tanstack/react-query` in dependencies, query keys centralized in `src/lib/queryKeys.ts`, hooks in `features/*/queries.ts` |
| **Module Exports** | ✅ PASS | TypeScript + named exports enforced (no default exports), all components/hooks use `export function` pattern |
| **UI System (MUI)** | ✅ PASS | `@mui/material` + `@mui/icons-material` in dependencies, theme in `src/lib/theme.ts`, all UI uses MUI components |
| **Deterministic UI States** | ✅ PASS | Architecture includes `LoadingState`, `ErrorMessage`, `EmptyState` components, all queries handle loading/error/empty/success |
| **One Error Model** | ✅ PASS | `AppError` class in `src/api/errors.ts` with kind/status/endpoint/safeDetails, all errors normalized |

**Pre-Phase 0 Gate Result**: ✅ PASS

**Rationale**: OpenAPI spec at `/api/tmdb-api.json` serves as the single source of truth for TMDB API contracts. TypeScript types will be generated using `openapi-typescript` package, ensuring type safety at compile time. Zod schemas will provide runtime validation layer on top of generated types.

**Action Required Before Phase 0**: None. Proceed with research to identify best practices for OpenAPI type generation and integration with openapi-fetch + Zod.

---

### Post-Phase 1 Re-evaluation

*GATE: Constitution check after completing research, data models, and contracts*

**Re-evaluation Date**: 2026-02-16  
**Artifacts Generated**:
- ✅ `research.md` (11 decision sections covering Vite setup, TMDB API endpoints, TanStack Query patterns, Zod schemas, MUI theming, React Router, localStorage, debouncing, AppError, testing)
- ✅ `data-model.md` (3 entities: Movie, Genre, Favorite with complete Zod schemas and validation rules)
- ✅ `contracts/tmdb-api.md` (4 TMDB endpoints documented: /discover/movie, /search/movie, /movie/{id}, /genre/movie/list)
- ✅ `quickstart.md` (Developer onboarding guide with setup, patterns, workflows)
- ✅ Agent context updated (GitHub Copilot instructions file created)

| Principle | Post-Phase 1 Status | Updated Evidence |
|-----------|---------------------|------------------|
| **II. OpenAPI Source of Truth** | ✅ PASS | ✓ OpenAPI spec exists at `/api/tmdb-api.json` (referenced in contracts/)<br>✓ `research.md` documents `openapi-typescript` type generation workflow<br>✓ `data-model.md` shows Zod schemas wrapping OpenAPI-generated types<br>✓ `quickstart.md` includes `npm run generate:types` workflow<br>**Implementation**: TypeScript types auto-generated from spec, validated at runtime with Zod |

**All Other Principles**: Status unchanged from pre-Phase 0 evaluation (all ✅ PASS).

**Post-Phase 1 Gate Result**: ✅ PASS

**Action Required Before Implementation**: None. All planning artifacts complete. Proceed to `speckit.tasks` command to generate task breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── client.ts              # openapi-fetch client config with TMDB base URL + API key
│   ├── errors.ts              # AppError class + error normalization
│   ├── validate.ts            # Zod validation wrapper functions
│   ├── schemas.ts             # Zod schemas for TMDB API responses
│   └── adapters/              # Workarounds for TMDB API deviations (if any)
├── lib/
│   ├── queryKeys.ts           # TanStack Query key factory
│   └── theme.ts               # MUI theme configuration
├── features/
│   ├── movies/
│   │   ├── queries.ts         # useMoviesQuery, useMovieDetailsQuery hooks
│   │   ├── components/
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieGrid.tsx
│   │   │   ├── MovieFilters.tsx
│   │   │   ├── MovieDetails.tsx
│   │   │   └── Pagination.tsx
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       └── MovieDetailsPage.tsx
│   └── favorites/
│       ├── hooks/
│       │   └── useFavorites.ts  # localStorage favorites management
│       ├── components/
│       │   └── FavoritesList.tsx
│       └── pages/
│           └── FavoritesPage.tsx
├── components/                # Shared components
│   ├── AppBar.tsx
│   ├── ErrorMessage.tsx
│   ├── LoadingState.tsx
│   └── EmptyState.tsx
├── App.tsx                    # Provider setup (QueryClient, Router, Theme)
├── main.tsx                   # Vite entry point
└── router.tsx                 # React Router routes config

tests/
├── unit/
│   ├── api/
│   ├── features/
│   └── lib/
└── integration/
    └── features/

public/
└── placeholder-movie.png      # Fallback for missing posters

specs/001-movie-discovery/     # Feature documentation
docs/
├── contract-deviations.md     # TMDB API deviations tracking
└── quickstart.md              # Developer guide (generated in Phase 1)
```

**Structure Decision**: Web application (frontend-only). Constitution mandates `src/api/` for centralized API access, `src/features/<feature>/` for feature-based organization, and `src/lib/` for shared utilities. MUI components replace custom CSS. TanStack Query hooks live in `features/*/queries.ts`.

## Complexity Tracking

> No violations detected. Architecture aligns with constitution requirements.
