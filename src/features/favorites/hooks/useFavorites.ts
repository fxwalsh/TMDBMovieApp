import { useCallback, useState } from 'react'
import { favoritesArraySchema } from '@/api/schemas'

const FAVORITES_STORAGE_KEY = 'tmdb-favorites'

export function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return favoritesArraySchema.parse(parsed)
  } catch {
    localStorage.removeItem(FAVORITES_STORAGE_KEY)
    return []
  }
}

export function saveFavorites(favorites: number[]): void {
  const validatedFavorites = favoritesArraySchema.parse(favorites)
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validatedFavorites))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => loadFavorites())

  const toggleFavorite = useCallback((movieId: number) => {
    setFavorites((previousFavorites) => {
      const nextFavorites = previousFavorites.includes(movieId)
        ? previousFavorites.filter((id) => id !== movieId)
        : [...previousFavorites, movieId]

      saveFavorites(nextFavorites)
      return nextFavorites
    })
  }, [])

  const isFavorite = useCallback(
    (movieId: number) => {
      return favorites.includes(movieId)
    },
    [favorites]
  )

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  }
}
