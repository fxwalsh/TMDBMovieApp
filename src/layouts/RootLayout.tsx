import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppBar } from '@/components/AppBar'

export function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
