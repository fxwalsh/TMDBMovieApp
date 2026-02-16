import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import { validateResponse } from '@/api/validate'
import { movieListResponseSchema, type MovieListResponse } from '@/api/schemas'
import { queryKeys } from '@/lib/queryKeys'
import { AppError } from '@/api/errors'

export interface UseMoviesOptions {
  page?: number
  genreId?: number
}

/**
 * Query hook for fetching paginated movies from /discover/movie
 */
export function useMovies({ page = 1, genreId }: UseMoviesOptions = {}) {
  return useQuery({
    queryKey: queryKeys.movies.list({ page, genreId }),
    queryFn: async (): Promise<MovieListResponse> => {
      const params: Record<string, string> = {
        page: page.toString(),
        sort_by: 'popularity.desc',
      }

      if (genreId) {
        params.with_genres = genreId.toString()
      }

      const response = await client.GET('/3/discover/movie', {
        params: {
          query: params,
        },
      })

      // Handle errors - openapi-fetch returns either {data} or {error}
      if (!response.data) {
        throw new AppError({
          kind: 'Server',
          endpoint: '/3/discover/movie',
          safeDetails: 'Failed to fetch movies. Please try again.',
        })
      }

      return validateResponse(response.data, movieListResponseSchema, '/3/discover/movie')
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
