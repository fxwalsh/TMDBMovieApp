import { Button } from '@mui/material'
import { Favorite, FavoriteBorder } from '@mui/icons-material'

export interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
}

export function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <Button
      variant={isFavorite ? 'contained' : 'outlined'}
      color={isFavorite ? 'secondary' : 'primary'}
      startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
      onClick={onToggle}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
    </Button>
  )
}
