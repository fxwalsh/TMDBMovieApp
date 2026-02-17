import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'
import { useMovies } from '../queries/useMovies'
import { useSearchMovies } from '../queries/useSearchMovies'
import { useGenres } from '../queries/useGenres'
import { MovieGrid } from '../components/MovieGrid'
import { MovieFilters } from '../components/MovieFilters'
import { Pagination } from '../components/Pagination'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { useDebounce } from '@/shared/hooks/useDebounce'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(() => {
    const parsedPage = Number(searchParams.get('page') ?? '1')
    return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  })

  const [titleFilter, setTitleFilter] = useState(() => searchParams.get('title') ?? '')

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(() => {
    const genre = searchParams.get('genre')
    const parsedGenre = Number(genre)
    return Number.isInteger(parsedGenre) && parsedGenre > 0 ? parsedGenre : null
  })

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

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (page > 1) {
      nextParams.set('page', page.toString())
    }

    if (titleFilter.trim().length > 0) {
      nextParams.set('title', titleFilter.trim())
    }

    if (selectedGenreId) {
      nextParams.set('genre', selectedGenreId.toString())
    }

    setSearchParams(nextParams, { replace: true })
  }, [page, selectedGenreId, setSearchParams, titleFilter])

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

      {isLoading ? <MovieGrid movies={[]} isLoading /> : null}

      {error && <ErrorMessage error={error} title="Failed to load movies" />}

      {!isLoading && !error && movies.length === 0 ? <EmptyState message={emptyMessage} /> : null}

      {!isLoading && !error && movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
    </Container>
  )
}
