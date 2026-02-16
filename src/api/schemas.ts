import { z } from 'zod'

/**
 * Movie entity schema - wraps OpenAPI type for runtime validation
 */
export const movieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  vote_average: z.number().min(0).max(10),
  genre_ids: z.array(z.number()).optional(), // List responses
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(), // Detail responses
  runtime: z.number().int().positive().nullable().optional(),
  popularity: z.number().optional(),
})

export type Movie = z.infer<typeof movieSchema>

/**
 * Paginated movie list response schema
 */
export const movieListResponseSchema = z.object({
  page: z.number().int().positive(),
  results: z.array(movieSchema),
  total_pages: z.number().int(),
  total_results: z.number().int(),
})

export type MovieListResponse = z.infer<typeof movieListResponseSchema>

/**
 * Genre entity schema
 */
export const genreSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
})

export type Genre = z.infer<typeof genreSchema>

/**
 * Genre list response schema
 */
export const genreListResponseSchema = z.object({
  genres: z.array(genreSchema),
})

export type GenreListResponse = z.infer<typeof genreListResponseSchema>

/**
 * Movie details schema (includes full genre objects and runtime)
 */
export const movieDetailsSchema = movieSchema.extend({
  genres: z.array(genreSchema),
  runtime: z.number().int().positive().nullable(),
})

export type MovieDetails = z.infer<typeof movieDetailsSchema>

/**
 * Favorites array schema (array of movie IDs in localStorage)
 */
export const favoritesArraySchema = z.array(z.number().int().positive())

export type FavoritesArray = z.infer<typeof favoritesArraySchema>

/**
 * Utility functions for derived movie properties
 */

export function getMovieYear(movie: Movie): string {
  if (!movie.release_date) return 'Unknown'
  return new Date(movie.release_date).getFullYear().toString()
}

export function getPosterUrl(
  posterPath: string | null,
  size: 'w154' | 'w342' | 'w500' = 'w342'
): string {
  if (!posterPath) return '/placeholder-movie.svg'
  return `https://image.tmdb.org/t/p/${size}${posterPath}`
}

export function getRatingColor(rating: number): 'success' | 'warning' | 'error' {
  if (rating >= 7) return 'success'
  if (rating >= 5) return 'warning'
  return 'error'
}
