export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error(
      "VITE_API_URL is not set. Copy .env.example to .env and configure the API URL."
    )
  }
  return url
}
