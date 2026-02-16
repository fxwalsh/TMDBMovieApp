import { CircularProgress, Box, Typography } from '@mui/material'

export interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}
