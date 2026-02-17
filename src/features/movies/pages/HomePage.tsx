import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'
import { useMovies } from '../queries/useMovies'
import { useSearchMovies } from '../queries/useSearchMovies'
import { useGenres } from '../queries/useGenres'
import { MovieGrid } from '../components/MovieGrid'
import { MovieFilters } from '../components/MovieFilters'
import { Pagination } from '../components/Pagination'
import { LoadingState } from '@/components/LoadingState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import type { Movie } from '@/api/schemas'
import { useDebounce } from '@/shared/hooks/useDebounce'

export function HomePage() {
  const [page, setPage] = useState(1)
  const [titleFilter, setTitleFilter] = useState('')
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const navigate = useNavigate()

  const debouncedTitle = useDebounce(titleFilter.trim(), 500)
  const isSearchActive = debouncedTitle.length > 0

  const {
    data: browseData,
    isLoading: isBrowseLoading,
    error: browseError,
  } = useMovies({
    page,
    genreId: selectedGenreId ?? undefined,
    enabled: !isSearchActive,
  })

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchMovies({
    query: debouncedTitle,
    page,
    enabled: isSearchActive,
  })

  const { data: genresData, isLoading: isGenresLoading } = useGenres()

  useEffect(() => {
    setPage(1)
  }, [debouncedTitle, selectedGenreId])

  const { movies, totalPages } = useMemo(() => {
    const activeData = isSearchActive ? searchData : browseData
    const baseMovies = activeData?.results ?? []

    const filteredMovies =
      isSearchActive && selectedGenreId
        ? baseMovies.filter((movie) => movie.genre_ids?.includes(selectedGenreId))
        : baseMovies

    return {
      movies: filteredMovies,
      totalPages: activeData?.total_pages ?? 0,
    }
  }, [browseData, isSearchActive, searchData, selectedGenreId])

  const isLoading = isSearchActive ? isSearchLoading : isBrowseLoading
  const error = isSearchActive ? searchError : browseError

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []

    if (debouncedTitle) {
      labels.push(`title "${debouncedTitle}"`)
    }

    if (selectedGenreId) {
      const genreName = genresData?.genres.find((genre) => genre.id === selectedGenreId)?.name
      labels.push(genreName ? `genre "${genreName}"` : 'selected genre')
    }

    return labels
  }, [debouncedTitle, genresData?.genres, selectedGenreId])

  const emptyMessage = activeFilterLabels.length
    ? `No movies found for ${activeFilterLabels.join(' and ')}.`
    : 'No movies found. Try adjusting your filters.'

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

      <MovieFilters
        title={titleFilter}
        onTitleChange={setTitleFilter}
        genres={genresData?.genres ?? []}
        selectedGenreId={selectedGenreId}
        onGenreChange={setSelectedGenreId}
        isLoading={isGenresLoading}
      />

      {isLoading && <LoadingState message="Loading movies..." />}

      {error && <ErrorMessage error={error} title="Failed to load movies" />}

      {!isLoading && !error && movies.length === 0 && <EmptyState message={emptyMessage} />}

      {movies.length > 0 && (
        <>
          <MovieGrid movies={movies} onMovieClick={handleMovieClick} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  )
}
