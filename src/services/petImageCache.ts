import type { Pet } from '../types/pet'

// Remembers the live photo chosen for each pet so a dog keeps the same photo across
// cards, reloads and visits. Backed by localStorage; if storage is unavailable
// (private mode, blocked, full), the in-memory copy still keeps photos stable for the session.
export const PET_IMAGE_STORAGE_KEY = 'pawsmatch:pet-images'

let images: Record<string, string> | null = null

function loadImages(): Record<string, string> {
  if (images) return images
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PET_IMAGE_STORAGE_KEY) ?? '{}')
    images = parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    images = {}
  }
  return images
}

export function getCachedImage(petId: Pet['id']): string | undefined {
  return loadImages()[petId]
}

export function setCachedImage(petId: Pet['id'], imageUrl: string): void {
  const cached = loadImages()
  cached[petId] = imageUrl
  try {
    localStorage.setItem(PET_IMAGE_STORAGE_KEY, JSON.stringify(cached))
  } catch {
    // Keep the in-memory copy; the photo just won't survive a page reload.
  }
}

export function isImageUsedByAnotherPet(imageUrl: string, petId: Pet['id']): boolean {
  return Object.entries(loadImages()).some(([id, url]) => url === imageUrl && id !== String(petId))
}

export function clearImageCache(): void {
  images = {}
  try {
    localStorage.removeItem(PET_IMAGE_STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
