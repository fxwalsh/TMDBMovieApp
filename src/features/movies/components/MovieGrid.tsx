import { Box } from '@mui/material'
import { MovieCard } from './MovieCard'
import type { Movie } from '@/api/schemas'

export interface MovieGridProps {
  movies: Movie[]
  onMovieClick?: (movie: Movie) => void
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
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
      }}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick?.(movie)} />
      ))}
    </Box>
  )
}
