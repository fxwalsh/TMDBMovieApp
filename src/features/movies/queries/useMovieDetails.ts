import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import { AppError } from '@/api/errors'
import { movieDetailsSchema, type MovieDetails } from '@/api/schemas'
import { validateResponse } from '@/api/validate'
import { queryKeys } from '@/lib/queryKeys'

export function movieDetailsQueryOptions(movieId: number) {
  return queryOptions({
    queryKey: queryKeys.movies.detail(movieId),
    queryFn: async (): Promise<MovieDetails> => {
      const response = await client.GET('/3/movie/{movie_id}', {
        params: {
          path: {
            movie_id: movieId,
          },
        },
      })

      if (!response.data) {
        throw new AppError({
          kind: 'NotFound',
          endpoint: '/3/movie/{movie_id}',
          safeDetails: 'Movie not found. Please try a different selection.',
        })
      }

      return validateResponse(response.data, movieDetailsSchema, '/3/movie/{movie_id}')
    },
    staleTime: 1000 * 60 * 10,
  })
}

export interface UseMovieDetailsOptions {
  enabled?: boolean
}

export function useMovieDetails(movieId: number, options: UseMovieDetailsOptions = {}) {
  return useQuery({
    ...movieDetailsQueryOptions(movieId),
    enabled: options.enabled ?? true,
  })
}

export function useMovieDetailsQueries(movieIds: number[]) {
  return useQueries({
    queries: movieIds.map((movieId) => ({
      ...movieDetailsQueryOptions(movieId),
      enabled: movieIds.length > 0,
    })),
  })
}
