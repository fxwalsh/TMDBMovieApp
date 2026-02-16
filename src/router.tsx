import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { RootLayout } from './layouts/RootLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'movie/:id',
        element: <div>Movie Details (Coming Soon)</div>,
      },
    ],
  },
])
