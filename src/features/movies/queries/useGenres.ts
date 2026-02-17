import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import { validateResponse } from '@/api/validate'
import { genreListResponseSchema, type GenreListResponse } from '@/api/schemas'
import { queryKeys } from '@/lib/queryKeys'
import { AppError } from '@/api/errors'

/**
 * Query hook for fetching the genre list from /genre/movie/list
 */
export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres.list(),
    queryFn: async (): Promise<GenreListResponse> => {
      const response = await client.GET('/3/genre/movie/list')

      if (!response.data) {
        throw new AppError({
          kind: 'Server',
          endpoint: '/3/genre/movie/list',
          safeDetails: 'Failed to load genres. Please try again.',
        })
      }

      return validateResponse(response.data, genreListResponseSchema, '/3/genre/movie/list')
    },
    staleTime: Infinity,
  })
}
