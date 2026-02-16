import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Movie as MovieIcon, Favorite as FavoriteIcon } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

export function AppBar() {
  return (
    <MuiAppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <MovieIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TMDB Movie Discovery
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/" startIcon={<MovieIcon />}>
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/favorites" startIcon={<FavoriteIcon />}>
            Favorites
          </Button>
        </Box>
      </Toolbar>
    </MuiAppBar>
  )
}
