import { Box, Pagination as MuiPagination, Typography } from '@mui/material'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mt: 4,
        mb: 4,
      }}
    >
      <MuiPagination
        count={Math.min(totalPages, 500)} // TMDB API limits to 500 pages
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
      />
      <Typography variant="body2" color="text.secondary">
        Page {currentPage} of {Math.min(totalPages, 500)}
      </Typography>
    </Box>
  )
}
