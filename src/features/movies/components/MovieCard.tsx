import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  CardActionArea,
} from '@mui/material'
import { Star as StarIcon } from '@mui/icons-material'
import { memo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Movie } from '@/api/schemas'
import { getPosterUrl, getMovieYear, getRatingColor } from '@/api/schemas'

export interface MovieCardProps {
  movie: Movie
  onClick?: () => void
  action?: ReactNode
  disableNavigation?: boolean
}

export const MovieCard = memo(function MovieCard({
  movie,
  onClick,
  action,
  disableNavigation = false,
}: MovieCardProps) {
  const navigate = useNavigate()
  const posterUrl = getPosterUrl(movie.poster_path)
  const [imageSrc, setImageSrc] = useState(posterUrl)
  const year = getMovieYear(movie)
  const ratingColor = getRatingColor(movie.vote_average)

  const handleCardClick = () => {
    if (!disableNavigation) {
      navigate(`/movie/${movie.id}`)
    }
    onClick?.()
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        onClick={handleCardClick}
        sx={{ flexGrow: 1 }}
        aria-label={`View details for ${movie.title}`}
      >
        <CardMedia
          component="img"
          height="400"
          image={imageSrc}
          alt={movie.title}
          sx={{ objectFit: 'cover' }}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.includes('/placeholder-movie.svg')) {
              return
            }
            setImageSrc('/placeholder-movie.svg')
          }}
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
              aria-label={`Rating ${movie.vote_average.toFixed(1)}`}
            />
          </Box>
        </CardContent>
      </CardActionArea>
      {action ? (
        <CardActions>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>{action}</Box>
        </CardActions>
      ) : null}
    </Card>
  )
})
