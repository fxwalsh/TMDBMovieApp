import { Box, Typography } from '@mui/material'
import { MovieFilter as MovieFilterIcon } from '@mui/icons-material'

export interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
        padding: 4,
      }}
    >
      <Box sx={{ fontSize: 64, color: 'text.disabled' }}>
        {icon || <MovieFilterIcon fontSize="inherit" />}
      </Box>
      <Typography variant="h6" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  )
}
