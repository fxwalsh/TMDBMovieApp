import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Container, Stack } from '@mui/material'
import { AppError } from '@/api/errors'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingState } from '@/components/LoadingState'
import { MovieDetails } from '@/features/movies/components/MovieDetails'
import { useMovieDetails } from '@/features/movies/queries/useMovieDetails'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'

export function MovieDetailsPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const movieId = Number(params.id)
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0

  const { isFavorite, toggleFavorite } = useFavorites()

  const { data, isLoading, error } = useMovieDetails(movieId, {
    enabled: isValidMovieId,
  })

  const invalidMovieError = useMemo(
    () =>
      new AppError({
        kind: 'Validation',
        endpoint: '/movie/:id',
        safeDetails: 'Invalid movie id. Please return to the movie list and try again.',
      }),
    []
  )

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
            aria-label="Go back to previous page"
          >
            Back
          </Button>

          {data ? (
            <FavoriteButton
              isFavorite={isFavorite(data.id)}
              onToggle={() => toggleFavorite(data.id)}
            />
          ) : null}
        </Box>

        {!isValidMovieId ? <ErrorMessage error={invalidMovieError} title="Invalid movie" /> : null}

        {isValidMovieId && isLoading ? <LoadingState message="Loading movie details..." /> : null}

        {isValidMovieId && error ? <ErrorMessage error={error} title="Failed to load movie" /> : null}

        {isValidMovieId && data ? <MovieDetails movie={data} /> : null}
      </Stack>
    </Container>
  )
}
