import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'
import { useMovies } from '../queries/useMovies'
import { MovieGrid } from '../components/MovieGrid'
import { Pagination } from '../components/Pagination'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import type { Movie } from '@/api/schemas'

export function HomePage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading, error } = useMovies({ page })

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discover Movies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse popular movies from TMDB
        </Typography>
      </Box>

      {isLoading && <LoadingState message="Loading movies..." />}

      {error && <ErrorMessage error={error} title="Failed to load movies" />}

      {data && data.results.length === 0 && (
        <EmptyState message="No movies found. Try adjusting your filters." />
      )}

      {data && data.results.length > 0 && (
        <>
          <MovieGrid movies={data.results} onMovieClick={handleMovieClick} />
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  )
}
