# Data Model: Movie Discovery App

**Date**: 2026-02-16  
**Feature**: Movie Discovery App  
**Purpose**: Define entities, relationships, validation rules, and state management

## Type Generation Strategy

**Source of Truth**: OpenAPI specification at `/api/tmdb-api.json` (OpenAPI 3.1.0)

**Approach**:
1. **Compile-time types** generated using `openapi-typescript` from the spec
2. **Runtime validation** using Zod schemas that wrap OpenAPI types
3. **Type safety** enforced at both compile-time and runtime per Constitution Principles II & IV

**Type Generation Command**:
```bash
npm run generate:types  # Generates src/api/generated/tmdb.ts
```

**Usage Pattern**:
```typescript
import type { components, paths } from '@/api/generated/tmdb'
import { z } from 'zod'

// Extract OpenAPI types
type TMDBMovie = components['schemas']['Movie']

// Wrap with Zod for runtime validation
const movieSchema = z.object({...}) satisfies z.Schema<TMDBMovie>

// Export Zod-inferred type for components
export type Movie = z.infer<typeof movieSchema>
```

## Entity Overview

This application manages three primary entities:

1. **Movie** - Core entity representing a movie from TMDB (defined in OpenAPI spec)
2. **Genre** - Classification category for movies (defined in OpenAPI spec)
3. **Favorite** - User's saved movie preferences (client-side only, not in API spec)

---

## 1. Movie Entity

### Description
Represents a movie from TMDB database with all relevant metadata for discovery, filtering, and detailed views.

**OpenAPI Reference**: `components.schemas.Movie` (if defined) or inferred from `/3/discover/movie` and `/3/movie/{id}` response schemas in spec.

### Fields

| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| `id` | number | Yes | Positive integer | TMDB API |
| `title` | string | Yes | Non-empty string | TMDB API |
| `overview` | string \| null | No | Max 1000 chars | TMDB API |
| `poster_path` | string \| null | No | Valid path or null | TMDB API |
| `backdrop_path` | string \| null | No | Valid path or null | TMDB API |
| `release_date` | string \| null | No | ISO date format (YYYY-MM-DD) | TMDB API |
| `vote_average` | number | Yes | 0-10 range | TMDB API |
| `genre_ids` | number[] | Yes | Array of genre IDs | TMDB API (list response) |
| `genres` | Genre[] | No | Array of Genre objects | TMDB API (detail response) |
| `runtime` | number \| null | No | Positive integer (minutes) | TMDB API (detail only) |
| `popularity` | number | No | Positive number | TMDB API |

### Zod Schema (Runtime Validation Wrapper)

**Location**: `src/api/schemas.ts`

```typescript
import { z } from 'zod'
import type { components } from '@/api/generated/tmdb'

// Extract OpenAPI type (if available)
// type TMDBMovie = components['schemas']['Movie']

// Zod schema wraps OpenAPI type for runtime validation
export const movieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  vote_average: z.number().min(0).max(10),
  genre_ids: z.array(z.number()).optional(), // List responses
  genres: z.array(z.object({
    id: z.number(),
    name: z.string()
  })).optional(), // Detail responses
  runtime: z.number().int().positive().nullable().optional(),
  popularity: z.number().optional(),
}) // Can add: satisfies z.Schema<TMDBMovie> for type compatibility check

// Export Zod-inferred type (use this in components)
export type Movie = z.infer<typeof movieSchema>
```

**Why Both OpenAPI Types and Zod?**
- **openapi-fetch** uses OpenAPI types for compile-time autocomplete
- **Zod** validates actual API responses at runtime
- Together they catch both development errors (typos, wrong properties) and runtime errors (API changes, malformed data)

### Derived Properties

```typescript
// Computed on display
export function getMovieYear(movie: Movie): string {
  if (!movie.release_date) return 'Unknown'
  return new Date(movie.release_date).getFullYear().toString()
}

export function getPosterUrl(posterPath: string | null, size: 'w154' | 'w342' | 'w500' = 'w342'): string {
  if (!posterPath) return '/placeholder-movie.png'
  return `https://image.tmdb.org/t/p/${size}${posterPath}`
}

export function getRatingColor(rating: number): 'success' | 'warning' | 'error' {
  if (rating >= 7) return 'success'
  if (rating >= 5) return 'warning'
  return 'error'
}
```

### Relationships

- **Many-to-Many with Genre**: A movie has many genres, a genre is associated with many movies
- **One-to-Many with Favorite**: A movie can be favorited by the user (0 or 1 times)

---

## 2. Genre Entity

### Description
Represents a movie genre category from TMDB. Used for filtering and classification.

**OpenAPI Reference**: Inferred from `/3/genre/movie/list` response schema in spec.

### Fields

| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| `id` | number | Yes | Positive integer | TMDB API |
| `name` | string | Yes | Non-empty string | TMDB API |

### Zod Schema (Runtime Validation Wrapper)

```typescript
import { z } from 'zod'
import type { components } from '@/api/generated/tmdb'

// Zod schema for Genre
export const genreSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
})

export type Genre = z.infer<typeof genreSchema>

// Genre list response wrapper
export const genreListResponseSchema = z.object({
  genres: z.array(genreSchema),
})

export type GenreListResponse = z.infer<typeof genreListResponseSchema>
```

### Common Genres (Reference)

| ID | Name |
|----|------|
| 28 | Action |
| 12 | Adventure |
| 16 | Animation |
| 35 | Comedy |
| 80 | Crime |
| 99 | Documentary |
| 18 | Drama |
| 10751 | Family |
| 14 | Fantasy |
| 36 | History |
| 27 | Horror |
| 10402 | Music |
| 9648 | Mystery |
| 10749 | Romance |
| 878 | Science Fiction |
| 10770 | TV Movie |
| 53 | Thriller |
| 10752 | War |
| 37 | Western |

---

## 3. Favorite Entity

### Description
Client-side entity representing a user's favorite movie. Stored in localStorage as an array of movie IDs.

### Fields

| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| `movieId` | number | Yes | Positive integer, must exist in TMDB | Client state |

### Storage Schema

```typescript
// localStorage key
const FAVORITES_KEY = 'tmdb_favorites'

// Stored as JSON array
export type FavoritesStorage = number[]

// Example stored value:
// "[123, 456, 789]"
```

### Validation

```typescript
export const favoritesArraySchema = z.array(z.number().int().positive())

export function loadFavorites(): number[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return favoritesArraySchema.parse(parsed)
  } catch {
    // Invalid data - reset to empty
    localStorage.removeItem(FAVORITES_KEY)
    return []
  }
}

export function saveFavorites(favorites: number[]): void {
  try {
    favoritesArraySchema.parse(favorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {
    throw new Error('Invalid favorites data')
  }
}
```

### State Transitions

```
[Empty] --addFavorite(movieId)--> [Has Favorites]
[Has Favorites] --removeFavorite(movieId)--> [Empty or Has Favorites]
[Has Favorites] --clearAll()--> [Empty]
[Any State] --localStorage cleared externally--> [Empty]
```

---

## 4. API Response Schemas

**Note**: These schemas validate responses from TMDB API endpoints defined in `/api/tmdb-api.json`.

### MovieListResponse (Browse/Search)

**OpenAPI Reference**: Response schema for `GET /3/discover/movie` and `GET /3/search/movie`

```typescript
import { z } from 'zod'
import type { paths } from '@/api/generated/tmdb'

// OpenAPI type (compile-time)
type DiscoverMovieResponse = paths['/3/discover/movie']['get']['responses']['200']['content']['application/json']

// Zod schema (runtime validation)
export const movieListResponseSchema = z.object({
  page: z.number().int().positive(),
  results: z.array(movieSchema),
  total_pages: z.number().int().positive(),
  total_results: z.number().int().nonnegative(),
})

export type MovieListResponse = z.infer<typeof movieListResponseSchema>
```

**Usage**: `/discover/movie` (browse with filters), `/search/movie` (title search)

### MovieDetailsResponse

**OpenAPI Reference**: Response schema for `GET /3/movie/{movie_id}`

```typescript
export const movieDetailsSchema = movieSchema.extend({
  genres: z.array(genreSchema), // Required for details (not genre_ids)
  runtime: z.number().int().positive().nullable(),
  tagline: z.string().optional(),
  status: z.string().optional(),
  budget: z.number().optional(),
  revenue: z.number().optional(),
})

export type MovieDetails = z.infer<typeof movieDetailsSchema>
```

**Usage**: `/movie/{id}` response

---

## 5. Application State Management

### Server State (TanStack Query)

| Query Key | Data | Cache Time | Refetch Strategy |
|-----------|------|------------|------------------|
| `movieKeys.list(filters)` | MovieListResponse | 5 min | On mount, on window focus |
| `movieKeys.detail(id)` | MovieDetails | 10 min | On mount |
| `genreKeys.list()` | GenreListResponse | Infinity | Once (genres rarely change) |

### Client State (React State)

| State | Type | Location | Persistence |
|-------|------|----------|-------------|
| `favorites` | number[] | useFavorites hook | localStorage |
| `titleFilter` | string | HomePage component | Session only |
| `selectedGenre` | number \| null | HomePage component | Session only |
| `currentPage` | number | HomePage component | Session only |

### State Flow Diagram

```
User Input
    ↓
[titleFilter, selectedGenre, currentPage]
    ↓
useDebounce(titleFilter, 500ms)
    ↓
useMoviesQuery({ title, genre, page })
    ↓
TanStack Query Cache
    ↓
MovieGrid Component
    ↓
MovieCard Components
```

---

## 6. Validation Rules

### Runtime Validation (Zod)

All API responses MUST be validated before use:

```typescript
// src/api/validate.ts
import { AppError } from './errors'

export function validateResponse<T>(
  schema: z.ZodSchema<T>, 
  data: unknown, 
  endpoint: string
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      throw new AppError(
        'Validation',
        200,
        endpoint,
        'Invalid API response format'
      )
    }
    throw error
  }
}
```

### Display Validation (UI Layer)

```typescript
// Handle missing/null fields gracefully
export function formatMovieOverview(overview: string | null): string {
  return overview || 'No overview available.'
}

export function formatReleaseDate(date: string | null): string {
  if (!date) return 'Release date unknown'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

export function formatRuntime(runtime: number | null): string {
  if (!runtime) return 'Runtime unknown'
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
```

---

## 7. Error Cases & Handling

### Movie Entity Errors

| Error Scenario | Detection | Handling |
|----------------|-----------|----------|
| Missing poster | `poster_path === null` | Show placeholder image |
| Missing overview | `overview === null` | Show "No overview available" |
| Invalid release date | Parse fails | Show "Release date unknown" |
| Zero runtime | `runtime === 0 or null` | Show "Runtime unknown" |
| Empty genre list | `genres.length === 0` | Show "No genres" |

### API Response Errors

| HTTP Status | AppError Kind | User Message |
|-------------|---------------|--------------|
| 401 | Unauthorized | "Invalid API key. Please check configuration." |
| 404 | NotFound | "Movie not found." |
| 429 | RateLimited | "Too many requests. Please wait and try again." |
| 500-599 | Server | "TMDB service is unavailable. Please try again later." |
| Network error | Network | "Unable to connect. Please check your internet connection." |

### Favorites Errors

| Error Scenario | Detection | Handling |
|----------------|-----------|----------|
| localStorage disabled | `setItem` throws | Show warning, disable favorites feature |
| Quota exceeded | `QuotaExceededError` | Show warning, suggest clearing old favorites |
| Invalid stored data | JSON parse fails | Clear storage, start fresh |

---

## 8. Data Transformation Examples

### List Response → Display Cards

```typescript
function transformMovieCardData(movie: Movie): MovieCardProps {
  return {
    id: movie.id,
    title: movie.title,
    year: getMovieYear(movie),
    rating: movie.vote_average,
    posterUrl: getPosterUrl(movie.poster_path, 'w342'),
    isFavorite: favorites.includes(movie.id),
  }
}
```

### Details Response → Details Page

```typescript
function transformMovieDetails(movie: MovieDetails): MovieDetailsDisplay {
  return {
    id: movie.id,
    title: movie.title,
    overview: formatMovieOverview(movie.overview),
    genres: movie.genres.map(g => g.name).join(', '),
    runtime: formatRuntime(movie.runtime),
    releaseDate: formatReleaseDate(movie.release_date),
    rating: movie.vote_average,
    posterUrl: getPosterUrl(movie.poster_path, 'w500'),
    backdropUrl: movie.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
      : null,
    isFavorite: favorites.includes(movie.id),
  }
}
```

---

## Summary

| Entity | Source | Storage | Validation | Key Relationships |
|--------|--------|---------|------------|-------------------|
| **Movie** | TMDB API | TanStack Query cache | Zod schema | Many-to-Many with Genre |
| **Genre** | TMDB API | TanStack Query cache (infinite) | Zod schema | Many-to-Many with Movie |
| **Favorite** | Client state | localStorage | Zod array schema | References Movie IDs |

All entities follow Constitution Principle IV (Runtime Validation at Boundary) and are designed for the deterministic UI states required by the Constitution.
