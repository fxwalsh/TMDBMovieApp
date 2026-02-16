import { Box, Typography } from '@mui/material'

export function FavoritesPage() {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Favorites
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Your favorite movies (implementation in progress)
      </Typography>
    </Box>
  )
}
