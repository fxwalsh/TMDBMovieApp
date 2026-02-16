import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  CardActionArea,
} from '@mui/material'
import { Star as StarIcon } from '@mui/icons-material'
import type { Movie } from '@/api/schemas'
import { getPosterUrl, getMovieYear, getRatingColor } from '@/api/schemas'

export interface MovieCardProps {
  movie: Movie
  onClick?: () => void
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path)
  const year = getMovieYear(movie)
  const ratingColor = getRatingColor(movie.vote_average)

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="400"
          image={posterUrl}
          alt={movie.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {movie.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {year}
            </Typography>
            <Chip
              icon={<StarIcon />}
              label={movie.vote_average.toFixed(1)}
              size="small"
              color={ratingColor}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
