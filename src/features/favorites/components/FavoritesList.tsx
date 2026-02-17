import { Button } from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import type { MovieDetails } from '@/api/schemas'
import { MovieGrid } from '@/features/movies/components/MovieGrid'

export interface FavoritesListProps {
  movies: MovieDetails[]
  onRemove: (movieId: number) => void
}

export function FavoritesList({ movies, onRemove }: FavoritesListProps) {
  return (
    <MovieGrid
      movies={movies}
      renderMovieAction={(movie) => (
        <Button
          color="error"
          variant="text"
          startIcon={<DeleteOutline />}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove(movie.id)
          }}
          aria-label={`Remove ${movie.title} from favorites`}
        >
          Remove
        </Button>
      )}
    />
  )
}
