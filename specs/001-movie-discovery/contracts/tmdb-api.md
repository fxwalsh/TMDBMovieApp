# TMDB API Contracts

**Date**: 2026-02-16  
**Feature**: Movie Discovery App  
**API Version**: TMDB v3  
**Base URL**: `https://api.themoviedb.org`

**OpenAPI Specification**: `/api/tmdb-api.json` (OpenAPI 3.1.0)

## Overview

This document provides a human-readable reference for the TMDB API endpoints used in this project. The **authoritative source of truth** is the OpenAPI specification at `/api/tmdb-api.json`.

**Type Generation**:
```bash
npm run generate:types  # Generates TypeScript types from spec
```

**Generated Types Location**: `src/api/generated/tmdb.ts`

**Constitution Compliance**: Per Principle II, the OpenAPI spec is the single source of truth. This document serves as supplementary documentation for developers.

## Authentication

All requests require an API key parameter:

```
?api_key={YOUR_API_KEY}
```

**Rate Limiting**: 40 requests per 10 seconds per IP address

---

## Endpoints Used

### 1. Discover Movies

**Endpoint**: `GET /discover/movie`

**Description**: Discover movies with optional filtering and sorting

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | API authentication key |
| `page` | integer | No | Page number (default: 1) |
| `with_genres` | integer | No | Genre ID to filter by (single genre) |
| `sort_by` | string | No | Sort method (default: `popularity.desc`) |
| `language` | string | No | Language code (default: `en-US`) |

**Response Schema**:

```json
{
  "page": 1,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "overview": "A ticking-time-bomb insomniac...",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "backdrop_path": "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
      "release_date": "1999-10-15",
      "vote_average": 8.4,
      "vote_count": 26280,
      "popularity": 63.869,
      "genre_ids": [18, 53, 35],
      "adult": false,
      "video": false,
      "original_language": "en",
      "original_title": "Fight Club"
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

**Usage**: User Story 1 (Browse), User Story 2 (Genre filtering)

---

### 2. Search Movies

**Endpoint**: `GET /search/movie`

**Description**: Search for movies by title

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | API authentication key |
| `query` | string | Yes | Movie title search query |
| `page` | integer | No | Page number (default: 1) |
| `include_adult` | boolean | No | Include adult content (default: false) |
| `language` | string | No | Language code (default: `en-US`) |
| `year` | integer | No | Filter by release year |

**Response Schema**:

Same as `/discover/movie` response

**Usage**: User Story 2 (Title filtering with 500ms debounce)

---

### 3. Get Movie Details

**Endpoint**: `GET /movie/{movie_id}`

**Description**: Get detailed information about a specific movie

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `movie_id` | integer | Yes | TMDB movie ID |

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | API authentication key |
| `language` | string | No | Language code (default: `en-US`) |

**Response Schema**:

```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "backdrop_path": "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
  "release_date": "1999-10-15",
  "runtime": 139,
  "vote_average": 8.4,
  "vote_count": 26280,
  "popularity": 63.869,
  "genres": [
    { "id": 18, "name": "Drama" },
    { "id": 53, "name": "Thriller" },
    { "id": 35, "name": "Comedy" }
  ],
  "budget": 63000000,
  "revenue": 100853753,
  "status": "Released",
  "tagline": "Mischief. Mayhem. Soap.",
  "homepage": "http://www.foxmovies.com/movies/fight-club",
  "imdb_id": "tt0137523",
  "original_language": "en",
  "original_title": "Fight Club",
  "adult": false,
  "video": false,
  "production_companies": [...],
  "production_countries": [...],
  "spoken_languages": [...]
}
```

**Usage**: User Story 3 (Movie details page)

---

### 4. Get Genre List

**Endpoint**: `GET /genre/movie/list`

**Description**: Get the list of official genres for movies

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | API authentication key |
| `language` | string | No | Language code (default: `en-US`) |

**Response Schema**:

```json
{
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 14, "name": "Fantasy" },
    { "id": 36, "name": "History" },
    { "id": 27, "name": "Horror" },
    { "id": 10402, "name": "Music" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 10770, "name": "TV Movie" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "War" },
    { "id": 37, "name": "Western" }
  ]
}
```

**Usage**: User Story 2 (Genre dropdown filter)

---

## Image Configuration

### Base URL
```
https://image.tmdb.org/t/p/
```

### Available Sizes

**Poster Sizes**: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`  
**Backdrop Sizes**: `w300`, `w780`, `w1280`, `original`

### Usage Pattern

```typescript
const posterUrl = `https://image.tmdb.org/t/p/w342${movie.poster_path}`
const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
```

**Recommendations**:
- Movie cards: `w342` posters
- Details page: `w500` posters, `original` backdrops
- Fallback: `/placeholder-movie.png` when `poster_path` is null

---

## Error Responses

### 401 Unauthorized

```json
{
  "status_code": 7,
  "status_message": "Invalid API key: You must be granted a valid key."
}
```

**Cause**: Invalid or missing `api_key` parameter

---

### 404 Not Found

```json
{
  "status_code": 34,
  "status_message": "The resource you requested could not be found."
}
```

**Cause**: Movie ID does not exist

---

### 429 Too Many Requests

```json
{
  "status_code": 25,
  "status_message": "Your request count is over the allowed limit."
}
```

**Cause**: Exceeded rate limit (40 requests / 10 seconds)

---

## Known Deviations & Workarounds

*This section will be updated during implementation if any deviations from documented behavior are discovered.*

Currently: No known deviations

---

## TypeScript Type Generation

Since TMDB doesn't provide an OpenAPI spec, types are manually created using Zod schemas (see `src/api/schemas.ts`).

**Example**:

```typescript
// From data-model.md
import { z } from 'zod'

const movieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().nullable(),
  // ... (see data-model.md for full schema)
})

export type Movie = z.infer<typeof movieSchema>
```

---

## Testing

### Contract Tests

Verify TMDB API behavior matches expectations:

```typescript
// tests/contract/tmdb-api.test.ts
describe('TMDB API Contracts', () => {
  it('should fetch movies from /discover/movie', async () => {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=1`
    )
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(movieListResponseSchema.safeParse(data).success).toBe(true)
  })
})
```

---

## References

**Primary (Source of Truth)**:
- **OpenAPI Specification**: `/api/tmdb-api.json` (OpenAPI 3.1.0) - Authoritative API contract
- **Generated Types**: `src/api/generated/tmdb.ts` - TypeScript types from spec

**External Documentation**:
- [TMDB v3 API Documentation](https://developers.themoviedb.org/3) - Human-readable API docs
- [TMDB Getting Started Guide](https://www.themoviedb.org/documentation/api) - Setup guide
- [TMDB Image Configuration](https://developers.themoviedb.org/3/configuration/get-api-configuration) - Image URL patterns

**Project Documentation**:
- [data-model.md](../data-model.md) - Entity definitions with Zod schemas
- [research.md](../research.md) - Section 2 covers OpenAPI type generation workflow
