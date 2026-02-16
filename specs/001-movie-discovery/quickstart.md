# Quickstart Guide: Movie Discovery Feature

**Feature ID**: 001  
**Target Audience**: Developers implementing this feature  
**Last Updated**: 2026-02-16  
**Estimated Setup Time**: 15 minutes

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.x or later (LTS recommended)
- **npm**: v9.x or later
- **TMDB API Key**: [Get one here](https://www.themoviedb.org/settings/api)
- **IDE**: VS Code with TypeScript extension recommended
- **Git**: Feature branch `001-movie-discovery` checked out

---

## Environment Setup

### 1. Install Dependencies

```bash
cd TMDBMovieApp
npm install
```

**Core Dependencies** (from research.md):
- `vite` - Build tool with fast HMR
- `react`, `react-dom` - UI library
- `typescript` - Type safety
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` - UI components
- `@tanstack/react-query` - Server state management
- `openapi-fetch` - Type-safe API client
- `zod` - Runtime validation
- `react-router-dom` - Client-side routing

**Dev Dependencies**:
- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` - Testing
- `@vitejs/plugin-react` - React + Vite integration

### 2. Configure Environment Variables

Create `.env` file in project root:

```env
VITE_TMDB_API_KEY=your_api_key_here
```

⚠️ **Security**: Never commit API keys. `.env` is in `.gitignore`.

### 3. Generate TypeScript Types from OpenAPI Spec

**Required**: Generate types before starting development

```bash
npm run generate:types
```

This command runs `openapi-typescript` to generate TypeScript types from `/api/tmdb-api.json`:

```bash
# Equivalent to:
npx openapi-typescript ./api/tmdb-api.json -o ./src/api/generated/tmdb.ts
```

**Output**: `src/api/generated/tmdb.ts` (auto-generated, do not edit manually)

**When to Regenerate**:
- After pulling changes to `/api/tmdb-api.json`
- When API endpoints or schemas change
- **Automatically** before `npm run dev` and `npm run build` (configured in package.json)

**Constitution Compliance**: Per Principle II ("OpenAPI Source of Truth"), all API types must be generated from the spec, never manually defined.

### 4. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

**Note**: `npm run dev` automatically runs `generate:types` first (see package.json scripts).

---

## Project Structure

```
TMDBMovieApp/
├── .specify/
│   ├── memory/
│   │   └── constitution.md          # Governance document (v1.2.0)
│   └── scripts/                     # Automation scripts
├── specs/
│   └── 001-movie-discovery/
│       ├── spec.md                  # Feature specification
│       ├── plan.md                  # Implementation plan
│       ├── research.md              # Technical decisions
│       ├── data-model.md            # Entity definitions
│       ├── contracts/tmdb-api.md    # API contracts
│       └── quickstart.md            # This file
├── src/
│   ├── api/
│   │   ├── generated/
│   │   │   └── tmdb.ts              # Auto-generated OpenAPI types (DO NOT EDIT)
│   │   ├── client.ts                # openapi-fetch client
│   │   ├── schemas.ts               # Zod validation schemas
│   │   ├── queryKeys.ts             # TanStack Query keys
│   │   └── hooks/
│   │       ├── useMovies.ts         # Discover movies query
│   │       ├── useSearchMovies.ts   # Search movies query
│   │       ├── useMovieDetails.ts   # Movie details query
│   │       └── useGenres.ts         # Genre list query
│   ├── features/
│   │   ├── movies/
│   │   │   ├── pages/
│   │   │   │   ├── MovieListPage.tsx
│   │   │   │   └── MovieDetailsPage.tsx
│   │   │   └── components/
│   │   │       ├── MovieCard.tsx
│   │   │       ├── MovieFilters.tsx
│   │   │       └── FavoriteButton.tsx
│   │   └── favorites/
│   │       ├── hooks/useFavorites.ts
│   │       └── storage.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   ├── theme/
│   │   │   └── theme.ts             # MUI theme configuration
│   │   └── types/
│   │       └── AppError.ts          # Error model
│   ├── App.tsx                      # Router setup
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts                # TypeScript declarations
├── tests/
│   ├── setup.ts                     # Vitest configuration
│   ├── contract/
│   │   └── tmdb-api.test.ts         # API contract tests
│   └── features/
│       └── movies/
│           └── MovieListPage.test.tsx
└── package.json
```

---

## Key Patterns

### 1. OpenAPI Type Generation Workflow

**Location**: `package.json` scripts

```json
{
  "scripts": {
    "generate:types": "openapi-typescript ./api/tmdb-api.json -o ./src/api/generated/tmdb.ts",
    "dev": "npm run generate:types && vite",
    "build": "npm run generate:types && tsc && vite build"
  }
}
```

**Generated File**: `src/api/generated/tmdb.ts`

```typescript
// Auto-generated by openapi-typescript - DO NOT EDIT
export interface paths {
  "/3/discover/movie": { get: operations["discover-movies"] }
  "/3/search/movie": { get: operations["search-movies"] }
  // ... more endpoints
}

export interface components {
  schemas: {
    Movie: { id: number; title: string; /* ... */ }
    Genre: { id: number; name: string }
    // ... more schemas
  }
}
```

**Usage**: Import types for compile-time safety

**Constitution Check**: ✅ OpenAPI Source of Truth (Principle II)

---

### 2. API Client Setup

**Location**: `src/api/client.ts`

```typescript
import createClient from 'openapi-fetch'
import type { paths } from './generated/tmdb' // Import OpenAPI types

const baseUrl = 'https://api.themoviedb.org'
const apiKey = import.meta.env.VITE_TMDB_API_KEY

// Generic client with OpenAPI types
export const tmdbClient = createClient<paths>({ baseUrl })

// Add API key to every request
tmdbClient.use({
  async onRequest(req) {
    const url = new URL(req.url)
    url.searchParams.set('api_key', apiKey)
    return new Request(url.toString(), req)
  }
})
```

**Benefits**:
- Full IntelliSense for all endpoints
- Compile-time errors for invalid paths/parameters
- Type narrowing based on HTTP status codes

**Constitution Check**: ✅ Centralized API Management (Principle III)

---

### 3. Zod Schema Definition (Runtime Validation)

**Location**: `src/api/schemas.ts`

```typescript
import { z } from 'zod'
import type { components } from './generated/tmdb'

// OpenAPI type (compile-time)
type TMDBMovie = components['schemas']['Movie'] // If defined in spec

// Zod schema (runtime validation)
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
}) // Can add: satisfies z.Schema<TMDBMovie> for type compat check

// API response schema
export const movieListResponseSchema = z.object({
  page: z.number().int().positive(),
  results: z.array(movieSchema),
  total_pages: z.number().int().nonnegative(),
  total_results: z.number().int().nonnegative(),
})

// Export TypeScript types
export type Movie = z.infer<typeof movieSchema>
export type MovieListResponse = z.infer<typeof movieListResponseSchema>
```

**Why Both OpenAPI and Zod?**
- **openapi-fetch** uses OpenAPI types for compile-time autocomplete
- **Zod** validates actual API responses at runtime
- Together: defense-in-depth (catch dev typos + API changes)

**Constitution Check**: ✅ Runtime Validation at Boundaries (Principle IV)

---

### 4. TanStack Query Hook

**Location**: `src/api/hooks/useMovies.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { tmdbClient } from '../client'
import { movieListResponseSchema } from '../schemas'
import { queryKeys } from '../queryKeys'

interface UseMoviesParams {
  page?: number
  genreId?: number
}

export function useMovies({ page = 1, genreId }: UseMoviesParams) {
  return useQuery({
    queryKey: queryKeys.movies.list({ page, genreId }),
    queryFn: async () => {
      const response = await tmdbClient.GET('/discover/movie', {
        params: {
          query: {
            page,
            ...(genreId && { with_genres: genreId }),
          },
        },
      })

      if (response.error) {
        throw new AppError('Failed to fetch movies', response.error)
      }

      // Runtime validation at boundary
      return movieListResponseSchema.parse(response.data)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}
```

**Constitution Check**: ✅ TanStack Query for Server State (Principle 5)

---

### 5. Query Key Factory

**Location**: `src/api/queryKeys.ts`

```typescript
export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    lists: () => [...queryKeys.movies.all, 'list'] as const,
    list: (filters: { page?: number; genreId?: number }) =>
      [...queryKeys.movies.lists(), filters] as const,
    details: () => [...queryKeys.movies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.movies.details(), id] as const,
  },
  genres: {
    all: ['genres'] as const,
    list: () => [...queryKeys.genres.all, 'list'] as const,
  },
} as const
```

**Constitution Check**: ✅ Centralized Query Keys (Research section 4)

---

### 6. MUI Theme Configuration

**Location**: `src/shared/theme/theme.ts`

```typescript
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})
```

**Constitution Check**: ✅ UI System (MUI) Requirement (Constitution v1.2.0)

---

### 7. Debounced Search Hook

**Location**: `src/shared/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Usage** (from spec clarifications):

```typescript
// In MovieFilters.tsx
const [titleInput, setTitleInput] = useState('')
const debouncedTitle = useDebounce(titleInput, 500)

const { data } = useSearchMovies({ query: debouncedTitle })
```

---

### 8. Favorites Management

**Location**: `src/features/favorites/hooks/useFavorites.ts`

```typescript
import { useState, useEffect } from 'react'
import { favoritesArraySchema } from '@/api/schemas'

const STORAGE_KEY = 'tmdb-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = favoritesArraySchema.parse(JSON.parse(stored))
        setFavorites(parsed)
      } catch (error) {
        console.error('Invalid favorites data', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const toggleFavorite = (movieId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (movieId: number) => favorites.includes(movieId)

  return { favorites, toggleFavorite, isFavorite }
}
```

---

### 9. Error Model

**Location**: `src/shared/types/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

**Constitution Check**: ✅ One Error Model (Principle 9)

---

## Common Workflows

### Adding a New API Query

1. **Define schema** in `src/api/schemas.ts`
2. **Add query key** to `src/api/queryKeys.ts`
3. **Create hook** in `src/api/hooks/useNewQuery.ts`:

```typescript
export function useNewQuery(params: NewQueryParams) {
  return useQuery({
    queryKey: queryKeys.newResource.detail(params.id),
    queryFn: async () => {
      const response = await tmdbClient.GET('/path', { params })
      if (response.error) throw new AppError('...', response.error)
      return newResponseSchema.parse(response.data)
    },
  })
}
```

4. **Export** from `src/api/hooks/index.ts` using named exports

---

### Creating a New Feature Component

1. **Create directory**: `src/features/{feature-name}/components/`
2. **Define component** with TypeScript + MUI:

```typescript
import { Card, CardContent, Typography } from '@mui/material'
import type { Movie } from '@/api/schemas'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{movie.title}</Typography>
      </CardContent>
    </Card>
  )
}
```

3. **Export** using named export (no default exports)

---

### Running Tests

**Unit Tests**:

```bash
npm run test
```

**Watch Mode**:

```bash
npm run test:watch
```

**Coverage**:

```bash
npm run test:coverage
```

**Test Pattern** (from research.md section 11):

```typescript
import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MovieListPage } from './MovieListPage'

describe('MovieListPage', () => {
  it('should display loading state', () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <MovieListPage />
      </QueryClientProvider>
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
```

---

## Constitution Compliance Checklist

Before submitting work, verify:

- [ ] **Spec-First Development**: Implementation matches `spec.md` requirements
- [ ] **Named Exports Only**: No `export default` statements (see §6)
- [ ] **Centralized API**: All TMDB calls go through `src/api/client.ts`
- [ ] **Runtime Validation**: Zod schemas validate all API responses at boundary
- [ ] **TanStack Query**: Server state uses `useQuery`/`useMutation` hooks
- [ ] **MUI Components**: All UI uses `@mui/material` (no custom CSS framework)
- [ ] **Deterministic States**: Loading/Error/Success states render distinct UI
- [ ] **AppError Model**: All errors use `AppError` class
- [ ] **Type Safety**: No `any` types, strict TypeScript enabled

See [constitution.md](../../.specify/memory/constitution.md) for full details.

---

## Debugging Tips

### API Key Issues

If you see 401 errors:

```bash
# Check environment variable is loaded
npm run dev
# Look for "VITE_TMDB_API_KEY is set" in console
```

Verify `.env` file exists and contains valid key.

---

### CORS Errors

TMDB API supports CORS. If seeing CORS errors:

- Check browser network tab for actual error
- Verify API key is valid
- Ensure `api_key` query parameter is present

---

### Type Errors with Zod

If Zod parsing fails:

```typescript
const result = movieSchema.safeParse(data)
if (!result.success) {
  console.error('Validation errors:', result.error.format())
}
```

This shows which fields failed validation.

---

### TanStack Query DevTools

Install React Query DevTools for debugging:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In App.tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## Next Steps

1. **Read [spec.md](spec.md)** - Understand functional requirements
2. **Review [data-model.md](data-model.md)** - See entity definitions
3. **Check [contracts/tmdb-api.md](contracts/tmdb-api.md)** - API reference
4. **Start implementation** - Begin with User Story 1 (P1: Browse movies)

For task breakdown, run:

```bash
# Generate tasks.md (separate command after planning)
npm run speckit:tasks
```

---

## Support

**Documentation**:
- [Constitution](../../.specify/memory/constitution.md)
- [Feature Spec](spec.md)
- [Implementation Plan](plan.md)

**External Resources**:
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [TanStack Query Guide](https://tanstack.com/query/latest/docs/react/overview)
- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [Zod Documentation](https://zod.dev/)

---

**Happy Coding! 🎬**
