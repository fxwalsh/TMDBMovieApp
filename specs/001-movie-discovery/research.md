# Research: Movie Discovery App

**Date**: 2026-02-16  
**Feature**: Movie Discovery App  
**Purpose**: Resolve technical unknowns and identify best practices for implementation

## Research Overview

This document consolidates findings for implementing a React + TypeScript movie discovery application using Vite, Material UI, TanStack Query, and TMDB API integration.

---

## 1. Vite + React + TypeScript Setup

### Decision: Use Vite's `react-ts` template

**Rationale**:
- Official template includes TypeScript, React 18, and optimized build configuration
- Fast HMR (Hot Module Replacement) with esbuild
- Minimal configuration needed out of the box

**Setup Command**:
```bash
npm create vite@latest . -- --template react-ts
```

**Key Configuration** (`vite.config.ts`):
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

**Alternatives Considered**:
- Create React App (CRA): Rejected - slower builds, deprecated in favor of Vite/Next.js
- Next.js: Rejected - overkill for SPA without SSR needs

---

## 2. OpenAPI Type Generation

### Decision: Use `openapi-typescript` to generate types from `/api/tmdb-api.json`

**Rationale**:
- **Constitution Principle II**: OpenAPI spec is the single source of truth
- OpenAPI spec exists at `/api/tmdb-api.json` (OpenAPI 3.1.0)
- `openapi-typescript` generates TypeScript types from spec (compile-time safety)
- `openapi-fetch` consumes generated types (type-safe API calls)
- Eliminates manual type definitions and sync issues

**Type Generation Workflow**:
```bash
# Install dependencies
npm install openapi-fetch
npm install -D openapi-typescript

# Generate types (add to package.json scripts)
npx openapi-typescript ./api/tmdb-api.json -o ./src/api/generated/tmdb.ts

# Regenerate types when spec changes
npm run generate:types
```

**package.json scripts**:
```json
{
  "scripts": {
    "generate:types": "openapi-typescript ./api/tmdb-api.json -o ./src/api/generated/tmdb.ts",
    "dev": "npm run generate:types && vite",
    "build": "npm run generate:types && tsc && vite build"
  }
}
```

**Integration with openapi-fetch** (`src/api/client.ts`):
```ts
import createClient from 'openapi-fetch'
import type { paths } from './generated/tmdb'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export const tmdbClient = createClient<paths>({
  baseUrl: 'https://api.themoviedb.org'
})

// Add API key to every request
tmdbClient.use({
  async onRequest(req) {
    const url = new URL(req.url)
    url.searchParams.set('api_key', API_KEY)
    return new Request(url.toString(), req)
  }
})
```

**Benefits**:
- Full IntelliSense for paths, parameters, and responses
- Compile-time errors for invalid API calls
- Auto-completion for deeply nested response properties
- Type narrowing based on HTTP status codes

**Alternatives Considered**:
- Manual TypeScript interfaces: Rejected - violates Constitution, error-prone, requires constant sync
- Zod schemas only: Rejected - no compile-time safety, redundant type definitions
- Other codegen tools (swagger-typescript-api, orval): Rejected - `openapi-typescript` is lightweight, widely adopted, pairs with `openapi-fetch`

---

## 3. TMDB API Authentication

### Decision: API key via query parameter with environment variables

**Rationale**:
- TMDB's standard authentication method for v3 API (documented in OpenAPI spec)
- Spec clarification Q1: API key in query parameter `?api_key=xxx`
- No backend server means API key exposed in client (acceptable for TMDB v3)

**Implementation** (see client.ts above):
- Store API key in `.env` as `VITE_TMDB_API_KEY`
- Use middleware pattern with `openapi-fetch` to inject on every request
- OpenAPI spec defines `sec0` security scheme (bearer token), but TMDB v3 actually uses query param

**Security Note**: 
- TMDB v3 API keys are designed for client-side use
- Configure domain restrictions in TMDB account settings
- Monitor rate limits (40 requests / 10 seconds per IP)
- Consider TMDB v4 API migration for production (uses bearer tokens)

**Alternatives Considered**:
- Bearer token in header: Not supported by TMDB v3 (only v4 API)
- Proxy through backend: Rejected - unnecessary complexity for public API

---

## 4. TMDB API Endpoints & Response Patterns

### Decision: Use `/discover/movie` and `/search/movie` with pagination

**Source**: OpenAPI spec at `/api/tmdb-api.json` defines all available endpoints

**Endpoints Used**:

1. **Browse/Genre Filtering**: `GET /discover/movie`
   - Query params: `page`, `with_genres`, `sort_by`
   - Returns: 20 movies per page by default
   - Supports genre ID filtering

2. **Title Search**: `GET /search/movie`
   - Query params: `query`, `page`
   - Returns: Movies matching title search (case-insensitive server-side)
   - Note: Genre filtering not directly supported, apply client-side if both filters active

3. **Movie Details**: `GET /movie/{movie_id}`
   - Returns: Full movie details (overview, runtime, genres, etc.)

4. **Genre List**: `GET /genre/movie/list`
   - Returns: All available genres with IDs
   - Fetch once and cache for genre dropdown

**Response Structure** (common pattern):
```json
{
  "page": 1,
  "results": [...],  // Array of movies
  "total_pages": 500,
  "total_results": 10000
}
```

**Poster Images**:
- Base URL: `https://image.tmdb.org/t/p/`
- Size options: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`
- Decision: Use `w342` for cards, `w500` for details page

**Alternatives Considered**:
- `/movie/popular`: Rejected - less flexible, no genre filtering
- `/trending/movie/week`: Rejected - limited to trending subset

---

## 5. TanStack Query Best Practices

### Decision: Centralized query keys + feature-based hooks

**Query Key Factory Pattern** (`src/lib/queryKeys.ts`):
```ts
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: MovieFilters) => [...movieKeys.lists(), filters] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
}

export const genreKeys = {
  all: ['genres'] as const,
  list: () => [...genreKeys.all, 'list'] as const,
}
```

**Hook Pattern** (`src/features/movies/queries.ts`):
```ts
export function useMoviesQuery(filters: MovieFilters) {
  return useQuery({
    queryKey: movieKeys.list(filters),
    queryFn: async () => {
      const response = await fetchMovies(filters)
      return validateMovieList(response) // Zod validation
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}
```

**Rationale**:
- Deterministic keys enable precise invalidation
- Feature-based hooks isolate query logic from components
- staleTime prevents unnecessary refetches
- Aligns with Constitution Principle V

**Alternatives Considered**:
- Global query file: Rejected - doesn't scale, violates feature organization
- String keys: Rejected - error-prone, no type safety

---

## 6. Zod Schema Validation with OpenAPI Types

### Decision: Wrap OpenAPI-generated types with Zod schemas for runtime validation

**Rationale**:
- **Constitution Principle II**: OpenAPI spec is source of truth for compile-time types
- **Constitution Principle IV**: Runtime validation at API boundaries required
- Zod provides runtime type checking that TypeScript cannot
- Catch API response changes/errors before they reach components

**Pattern: OpenAPI Types + Zod Validation** (`src/api/schemas.ts`):
```ts
import { z } from 'zod'
import type { components } from './generated/tmdb'

// Extract OpenAPI schema component types
type TMDBMovie = components['schemas']['Movie'] // If defined in spec
type TMDBMovieListResponse = components['schemas']['MovieListResponse']

// Create Zod schemas that validate OpenAPI types
export const movieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  vote_average: z.number().min(0).max(10),
  vote_count: z.number().int().nonnegative(),
  popularity: z.number().nonnegative(),
  genre_ids: z.array(z.number().int().positive()),
}) satisfies z.Schema<Omit<TMDBMovie, 'someOptionalField'>> // Ensure compatibility

export const movieListResponseSchema = z.object({
  page: z.number().int().positive(),
  results: z.array(movieSchema),
  total_pages: z.number().int().nonnegative(),
  total_results: z.number().int().nonnegative(),
})

// Export inferred types (use for components)
export type Movie = z.infer<typeof movieSchema>
export type MovieListResponse = z.infer<typeof movieListResponseSchema>
```

**Validation Wrapper** (`src/api/validate.ts`):
```ts
import { z } from 'zod'
import { AppError } from './errors'

export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint: string
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new AppError(
      'API response validation failed',
      result.error,
      'VALIDATION_ERROR',
      endpoint
    )
  }
  return result.data
}
```

**Usage in Query Hook**:
```ts
import { tmdbClient } from './client'
import { validateResponse, movieListResponseSchema } from './schemas'
import type { paths } from './generated/tmdb'

export function useMoviesQuery(filters: MovieFilters) {
  return useQuery({
    queryKey: movieKeys.list(filters),
    queryFn: async () => {
      // openapi-fetch provides compile-time types
      const { data, error } = await tmdbClient.GET('/3/discover/movie', {
        params: {
          query: {
            page: filters.page,
            with_genres: filters.genreId,
          }
        }
      })
      
      if (error) throw new AppError('Failed to fetch movies', error)
      
      // Zod provides runtime validation
      return validateResponse(movieListResponseSchema, data, '/discover/movie')
    },
    staleTime: 5 * 60 * 1000,
  })
}
```

**Why Both TypeScript and Zod?**:
- **TypeScript**: Compile-time safety from OpenAPI spec (catches typos, wrong paths)
- **Zod**: Runtime validation (catches API changes, malformed responses, null/undefined)
- Together they provide defense-in-depth

**Alternatives Considered**:
- Zod only (no OpenAPI): Rejected - violates Constitution Principle II, no compile-time checks
- TypeScript only (no Zod): Rejected - violates Constitution Principle IV, runtime errors slip through
- Other validation libraries (Yup, Joi, ArkType): Rejected - Zod has best TypeScript integration

---

## 7. Material UI Theming & Component Strategy

### Decision: Custom theme + MUI component library

**Theme Configuration** (`src/lib/theme.ts`):
```ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark', // Movie apps typically use dark themes
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  spacing: 8, // 8px base unit
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
})
```

**Component Choices**:
- Navigation: `AppBar` + `Toolbar` + `Button`
- Layout: `Container`, `Grid`
- Movie Cards: `Card`, `CardMedia`, `CardContent`, `CardActions`
- Filters: `TextField`, `Select`, `MenuItem`
- Loading: `CircularProgress`, `Skeleton`
- Pagination: `Pagination` component

**Rationale**:
- Dark theme reduces eye strain for media browsing
- MUI components are accessible by default (ARIA labels, keyboard nav)
- `theme.spacing()` ensures consistent spacing across app
- Aligns with Constitution UI System requirement

**Alternatives Considered**:
- Tailwind CSS: Rejected - Constitution mandates MUI
- Custom CSS modules: Rejected - violates MUI theming principle

---

## 8. React Router Configuration

### Decision: createBrowserRouter with data loaders

**Router Setup** (`src/router.tsx`):
```ts
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '@/features/movies/pages/HomePage'
import { MovieDetailsPage } from '@/features/movies/pages/MovieDetailsPage'
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage'
import { AppLayout } from '@/components/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'movie/:id',
        element: <MovieDetailsPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
    ],
  },
])
```

**Rationale**:
- `createBrowserRouter` is the modern React Router v6 API
- Nested routes with `<AppLayout>` provide persistent nav bar
- Path param `:id` for movie details
- No data loaders needed (TanStack Query handles data fetching)

**Alternatives Considered**:
- BrowserRouter with Routes: Rejected - less type-safe, older API
- Hash routing: Rejected - want clean URLs

---

## 9. localStorage for Favorites

### Decision: Custom hook with JSON serialization

**Implementation** (`src/features/favorites/hooks/useFavorites.ts`):
```ts
const FAVORITES_KEY = 'tmdb_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const addFavorite = (movieId: number) => {
    setFavorites((prev) => {
      const updated = [...prev, movieId]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removeFavorite = (movieId: number) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== movieId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const isFavorite = (movieId: number) => favorites.includes(movieId)

  return { favorites, addFavorite, removeFavorite, isFavorite }
}
```

**Rationale**:
- Single source of truth (React state + localStorage)
- Immediate persistence on every mutation
- Simple array of IDs (fetch full movie details on demand)
- Handles invalid JSON gracefully with fallback

**Alternatives Considered**:
- Store full movie objects: Rejected - data can become stale
- IndexedDB: Rejected - overkill for simple ID list
- Context API: Considered but not needed - custom hook is sufficient

---

## 10. Debouncing for Title Filter

### Decision: Use TanStack Query's built-in enabled option + useDebounce hook

**Implementation** (`src/hooks/useDebounce.ts`):
```ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

**Usage in Component**:
```ts
const [titleFilter, setTitleFilter] = useState('')
const debouncedTitle = useDebounce(titleFilter, 500)

const { data } = useMoviesQuery({ title: debouncedTitle })
```

**Rationale**:
- Simple, reusable hook pattern
- Delay set to 500ms per spec clarification Q5
- TanStack Query automatically cancels previous requests
- No external dependencies (lodash) needed

**Alternatives Considered**:
- lodash.debounce: Rejected - adds dependency for simple use case
- RxJS: Rejected - overkill for single input debouncing
- Manual setTimeout: Rejected - useDebounce hook is more maintainable

---

## 11. Error Handling & AppError Pattern

### Decision: Centralized error normalization with AppError class

**AppError Class** (`src/api/errors.ts`):
```ts
export type ErrorKind = 
  | 'Network'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'RateLimited'
  | 'Server'
  | 'Validation'
  | 'Unknown'

export class AppError extends Error {
  constructor(
    public kind: ErrorKind,
    public status: number | null,
    public endpoint: string,
    public safeDetails: string
  ) {
    super(safeDetails)
    this.name = 'AppError'
  }

  static fromResponse(response: Response, endpoint: string): AppError {
    const status = response.status
    let kind: ErrorKind = 'Unknown'
    let safeDetails = 'An error occurred'

    if (status === 401) {
      kind = 'Unauthorized'
      safeDetails = 'Invalid API key or unauthorized access'
    } else if (status === 404) {
      kind = 'NotFound'
      safeDetails = 'Resource not found'
    } else if (status === 429) {
      kind = 'RateLimited'
      safeDetails = 'Too many requests. Please try again later.'
    } else if (status >= 500) {
      kind = 'Server'
      safeDetails = 'Server error. Please try again later.'
    }

    return new AppError(kind, status, endpoint, safeDetails)
  }
}
```

**Rationale**:
- Aligns with Constitution's "One Error Model" requirement
- User-safe messages (no raw API errors or secrets exposed)
- Normalized structure for consistent error display
- Rate limiting awareness (TMDB has rate limits)

**Alternatives Considered**:
- Plain Error objects: Rejected - no structured error information
- HTTP status codes only: Rejected - not user-friendly

---

## 12. Testing Strategy

### Decision: Vitest + React Testing Library for unit/integration tests

**Setup**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Structure**:
- Unit tests: API utilities, validation, error handling
- Component tests: Isolated component rendering with mocks
- Integration tests: Full user flows (browse → details → favorite)

**Example Test** (`tests/unit/api/validate.test.ts`):
```ts
import { describe, it, expect } from 'vitest'
import { validateResponse } from '@/api/validate'
import { movieSchema } from '@/api/schemas'

describe('validateResponse', () => {
  it('should validate correct movie data', () => {
    const validData = { id: 1, title: 'Test', /* ... */ }
    expect(() => validateResponse(movieSchema, validData)).not.toThrow()
  })

  it('should throw AppError on invalid data', () => {
    const invalidData = { id: 'not-a-number' }
    expect(() => validateResponse(movieSchema, invalidData))
      .toThrow(AppError)
  })
})
```

**Rationale**:
- Vitest is Vite-native (fast, no config overhead)
- React Testing Library promotes accessibility testing
- Constitution requires tests to pass (Definition of Done)

**Alternatives Considered**:
- Jest: Rejected - slower, requires transform config for ESM
- Cypress: Deferred - E2E testing can be added later if needed

---

## Summary of Technical Decisions

| Decision Area | Choice | Key Rationale |
|---------------|--------|---------------|
| Build Tool | Vite 5.x | Fast HMR, minimal config, modern |
| Type Generation | openapi-typescript | Auto-gen types from `/api/tmdb-api.json` spec |
| API Client | openapi-fetch | Type-safe, Constitution-aligned |
| Validation | Zod + OpenAPI types | Runtime safety (Zod) + compile-time safety (OpenAPI) |
| State Management | TanStack Query | Server state, Constitution Principle V |
| UI Library | Material UI | Constitution requirement, accessible |
| Routing | React Router v6 | Modern API, type-safe |
| Storage | localStorage | Simple, sufficient for favorites |
| Debouncing | Custom useDebounce | Lightweight, no dependencies |
| Testing | Vitest | Vite-native, fast |

All decisions align with Constitution v1.2.0 requirements (especially Principle II: OpenAPI Source of Truth) and resolve technical unknowns from spec.md.
