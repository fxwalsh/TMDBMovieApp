import { useMemo } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingState } from '@/components/LoadingState'
import { FavoritesList } from '@/features/favorites/components/FavoritesList'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useMovieDetailsQueries } from '@/features/movies/queries/useMovieDetails'

export function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites()

  const favoriteQueries = useMovieDetailsQueries(favorites)

  const isLoading = favoriteQueries.some((query) => query.isLoading)
  const firstError = favoriteQueries.find((query) => query.error)?.error

  const favoriteMovies = useMemo(
    () => favoriteQueries.map((query) => query.data).filter((movie) => movie !== undefined),
    [favoriteQueries]
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Favorites
        </Typography>
        <Typography color="text.secondary">Your saved favorite movies.</Typography>
      </Box>

      {favorites.length === 0 ? (
        <EmptyState message="No favorites yet. Open a movie and add it to favorites." />
      ) : null}

      {favorites.length > 0 && isLoading ? (
        <LoadingState message="Loading favorite movies..." />
      ) : null}

      {favorites.length > 0 && firstError ? (
        <ErrorMessage error={firstError} title="Failed to load some favorites" />
      ) : null}

      {favorites.length > 0 && !isLoading && favoriteMovies.length > 0 ? (
        <FavoritesList movies={favoriteMovies} onRemove={toggleFavorite} />
      ) : null}
    </Container>
  )
}
