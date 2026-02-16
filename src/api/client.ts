import createClient from 'openapi-fetch'
import type { paths } from './generated/tmdb'

const BASE_URL = 'https://api.themoviedb.org'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

if (!API_KEY) {
  throw new Error(
    'VITE_TMDB_API_KEY environment variable is not set. Please add it to your .env file.'
  )
}

export const client = createClient<paths>({
  baseUrl: BASE_URL,
})

// Add API key to all requests as query parameter
client.use({
  onRequest({ request }) {
    const url = new URL(request.url)
    url.searchParams.set('api_key', API_KEY)
    return new Request(url.toString(), request)
  },
})
