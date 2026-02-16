import { Alert, AlertTitle, Box } from '@mui/material'
import type { AppError } from '@/api/errors'

export interface ErrorMessageProps {
  error: AppError | Error
  title?: string
}

export function ErrorMessage({ error, title = 'Error' }: ErrorMessageProps) {
  const message = 'safeDetails' in error ? error.safeDetails : error.message

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  )
}
