import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MovieDetailsPage } from './MovieDetailsPage'
import { AppError } from '@/api/errors'

const mockUseMovieDetails = vi.fn()

vi.mock('@/features/movies/queries/useMovieDetails', () => ({
  useMovieDetails: (movieId: number, options: { enabled?: boolean }) =>
    mockUseMovieDetails(movieId, options),
}))

vi.mock('@/features/favorites/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}))

function renderDetailsPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('MovieDetailsPage error states', () => {
  beforeEach(() => {
    mockUseMovieDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    })
  })

  it('shows validation error for invalid movie id', () => {
    renderDetailsPage('/movie/not-a-number')

    expect(
      screen.getByText('Invalid movie id. Please return to the movie list and try again.')
    ).toBeTruthy()
  })

  it('shows server error when movie request fails', () => {
    mockUseMovieDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new AppError({
        kind: 'Server',
        endpoint: '/3/movie/{movie_id}',
        safeDetails: 'TMDB service is unavailable. Please try again later.',
      }),
    })

    renderDetailsPage('/movie/123')

    expect(screen.getByText('TMDB service is unavailable. Please try again later.')).toBeTruthy()
  })
})
