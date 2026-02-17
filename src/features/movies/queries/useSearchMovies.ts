import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import { validateResponse } from '@/api/validate'
import { movieListResponseSchema, type MovieListResponse } from '@/api/schemas'
import { queryKeys } from '@/lib/queryKeys'
import { AppError } from '@/api/errors'

export interface UseSearchMoviesOptions {
  query: string
  page?: number
  enabled?: boolean
}

/**
 * Query hook for searching movies by title from /search/movie
 */
export function useSearchMovies({
  query,
  page = 1,
  enabled = true,
}: UseSearchMoviesOptions) {
  const trimmedQuery = query.trim()

  return useQuery({
    queryKey: queryKeys.movies.search(trimmedQuery, page),
    enabled: enabled && trimmedQuery.length > 0,
    queryFn: async (): Promise<MovieListResponse> => {
      if (!trimmedQuery) {
        throw new AppError({
          kind: 'Validation',
          endpoint: '/3/search/movie',
          safeDetails: 'Search query is required.',
        })
      }

      const response = await client.GET('/3/search/movie', {
        params: {
          query: {
            query: trimmedQuery,
            page,
            include_adult: false,
          },
        },
      })

      if (!response.data) {
        throw new AppError({
          kind: 'Server',
          endpoint: '/3/search/movie',
          safeDetails: 'Failed to search movies. Please try again.',
        })
      }

      return validateResponse(response.data, movieListResponseSchema, '/3/search/movie')
    },
    staleTime: 1000 * 60 * 5,
  })
}
