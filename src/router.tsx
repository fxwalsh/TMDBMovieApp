import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
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
        element: <MovieDetailsPage />,
      },
    ],
  },
])
