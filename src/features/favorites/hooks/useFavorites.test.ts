import { act, renderHook } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { loadFavorites, useFavorites } from './useFavorites'

function createLocalStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('useFavorites', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    })
  })

  beforeEach(() => {
    localStorage.clear()
  })

  it('persists favorites across remounts', () => {
    const firstRender = renderHook(() => useFavorites())

    act(() => {
      firstRender.result.current.toggleFavorite(42)
    })

    expect(firstRender.result.current.favorites).toEqual([42])
    expect(localStorage.getItem('tmdb-favorites')).toBe('[42]')

    firstRender.unmount()

    const secondRender = renderHook(() => useFavorites())
    expect(secondRender.result.current.favorites).toEqual([42])
    expect(secondRender.result.current.isFavorite(42)).toBe(true)
  })

  it('clears invalid localStorage data and returns empty favorites', () => {
    localStorage.setItem('tmdb-favorites', '{invalid-json')

    expect(loadFavorites()).toEqual([])
    expect(localStorage.getItem('tmdb-favorites')).toBeNull()
  })
})
