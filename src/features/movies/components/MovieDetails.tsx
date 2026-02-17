import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import { AccessTime, CalendarMonth, Star } from '@mui/icons-material'
import type { MovieDetails as MovieDetailsType } from '@/api/schemas'
import { getPosterUrl, getMovieYear, getRatingColor } from '@/api/schemas'

export interface MovieDetailsProps {
  movie: MovieDetailsType
}

function formatRuntime(runtime: number | null): string {
  if (!runtime || runtime <= 0) {
    return 'Runtime unknown'
  }

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (!hours) {
    return `${minutes}m`
  }

  return `${hours}h ${minutes}m`
}

function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) {
    return 'Release date unknown'
  }

  const date = new Date(releaseDate)
  if (Number.isNaN(date.getTime())) {
    return 'Release date unknown'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const posterUrl = getPosterUrl(movie.poster_path, 'w500')
  const ratingColor = getRatingColor(movie.vote_average)

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: 3,
        }}
      >
        <Box
          component="img"
          src={posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.includes('/placeholder-movie.svg')) {
              return
            }
            event.currentTarget.src = '/placeholder-movie.svg'
          }}
          sx={{ width: '100%', borderRadius: 2, objectFit: 'cover', maxHeight: 520 }}
        />

        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {movie.title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              icon={<Star />}
              label={movie.vote_average.toFixed(1)}
              color={ratingColor}
              aria-label={`Rating ${movie.vote_average.toFixed(1)}`}
            />
            <Chip
              icon={<CalendarMonth />}
              label={formatReleaseDate(movie.release_date)}
              variant="outlined"
            />
            <Chip icon={<AccessTime />} label={formatRuntime(movie.runtime)} variant="outlined" />
            <Chip label={getMovieYear(movie)} variant="outlined" />
          </Stack>

          <Divider />

          <Typography variant="h6">Overview</Typography>
          <Typography color="text.secondary">
            {movie.overview?.trim() ? movie.overview : 'No overview available.'}
          </Typography>

          <Typography variant="h6">Genres</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {movie.genres.length > 0 ? (
              movie.genres.map((genre) => <Chip key={genre.id} label={genre.name} variant="outlined" />)
            ) : (
              <Typography color="text.secondary">No genres available.</Typography>
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}
