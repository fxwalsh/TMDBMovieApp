/**
 * Centralized TanStack Query key factory
 * All query keys follow a hierarchical structure for efficient invalidation
 */

export const queryKeys = {
  // Movie keys
  movies: {
    all: ['movies'] as const,
    lists: () => [...queryKeys.movies.all, 'list'] as const,
    list: (filters: { page?: number; genreId?: number }) =>
      [...queryKeys.movies.lists(), filters] as const,
    search: (query: string, page?: number) =>
      [...queryKeys.movies.all, 'search', query, page] as const,
    details: () => [...queryKeys.movies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.movies.details(), id] as const,
  },

  // Genre keys
  genres: {
    all: ['genres'] as const,
    list: () => [...queryKeys.genres.all, 'list'] as const,
  },
} as const

// Type exports for use in hooks
export type MovieListKey = ReturnType<typeof queryKeys.movies.list>
export type MovieSearchKey = ReturnType<typeof queryKeys.movies.search>
export type MovieDetailKey = ReturnType<typeof queryKeys.movies.detail>
export type GenreListKey = ReturnType<typeof queryKeys.genres.list>
