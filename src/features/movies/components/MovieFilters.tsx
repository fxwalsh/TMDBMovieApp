import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import type { Genre } from '@/api/schemas'

export interface MovieFiltersProps {
  title: string
  onTitleChange: (value: string) => void
  genres: Genre[]
  selectedGenreId: number | null
  onGenreChange: (value: number | null) => void
  isLoading?: boolean
}

export function MovieFilters({
  title,
  onTitleChange,
  genres,
  selectedGenreId,
  onGenreChange,
  isLoading = false,
}: MovieFiltersProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 2,
        mb: 4,
      }}
    >
      <TextField
        id="movie-title-filter"
        label="Search by title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Try Inception, The Matrix, etc."
        fullWidth
        inputProps={{ 'aria-label': 'Search movies by title' }}
      />

      <FormControl fullWidth disabled={isLoading}>
        <InputLabel id="genre-filter-label">Genre</InputLabel>
        <Select
          labelId="genre-filter-label"
          id="genre-filter-select"
          label="Genre"
          value={selectedGenreId ?? null}
          onChange={(event) => {
            const value = event.target.value
            onGenreChange(Number(value) || null)
          }}
        >
          <MenuItem value="">All genres</MenuItem>
          {genres.map((genre) => (
            <MenuItem key={genre.id} value={genre.id}>
              {genre.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {isLoading ? 'Loading genres...' : 'Select a genre to filter'}
        </FormHelperText>
      </FormControl>
    </Box>
  )
}
