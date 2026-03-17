const FALLBACK_API_URL = 'https://raginspector-backend.onrender.com/api'

export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || FALLBACK_API_URL
}
