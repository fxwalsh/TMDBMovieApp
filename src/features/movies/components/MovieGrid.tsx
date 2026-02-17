import { Box, Card, CardContent, Skeleton } from '@mui/material'
import type { ReactNode } from 'react'
import { MovieCard } from './MovieCard'
import type { Movie } from '@/api/schemas'

export interface MovieGridProps {
  movies: Movie[]
  onMovieClick?: (movie: Movie) => void
  renderMovieAction?: (movie: Movie) => ReactNode
  isLoading?: boolean
}

export function MovieGrid({
  movies,
  onMovieClick,
  renderMovieAction,
  isLoading = false,
}: MovieGridProps) {
  const skeletonCards = Array.from({ length: 8 }, (_, index) => `movie-skeleton-${index}`)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {isLoading
        ? skeletonCards.map((key) => (
            <Card key={key} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Skeleton variant="rectangular" height={400} animation="wave" />
              <CardContent>
                <Skeleton variant="text" height={32} width="80%" animation="wave" />
                <Skeleton variant="text" height={24} width="40%" animation="wave" />
              </CardContent>
            </Card>
          ))
        : movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => onMovieClick?.(movie)}
              action={renderMovieAction?.(movie)}
            />
          ))}
    </Box>
  )
}
