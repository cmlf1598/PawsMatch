import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getPetWithLiveImage,
  fetchRandomDogImage,
  preloadImage,
} from '../services/petProvider'
import { useMatchStore } from '../stores/matchStore'
import { mockPets } from '../data/mockData'
import type { Pet } from '../types/pet'

export const BUFFER_SIZE = 3

/**
 * Pre-fetch Stack hook (Approach 2):
 * Maintains a buffer of 3 upcoming pets in memory (including preloaded images)
 * to ensure zero-latency transitions when liking or passing.
 */
export function useLivePet(initialPetId?: number) {
  const [stack, setStack] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const liked = useMatchStore((state) => state.liked)
  const passed = useMatchStore((state) => state.passed)
  const likePet = useMatchStore((state) => state.like)
  const passPet = useMatchStore((state) => state.pass)

  const fetchingIdsRef = useRef<Set<number>>(new Set())
  const initializedLoadKeyRef = useRef<string | null>(null)
  const loadRequestIdRef = useRef(0)

  // Initial load / reload: populate buffer with up to BUFFER_SIZE pets.
  // The ref guard makes this run once per load key, so StrictMode's double effect
  // invocation doesn't fetch the buffer twice. Because the guarded second run never
  // happens, the first run can't be cancelled from cleanup; instead, results are
  // dropped only when a newer load has started (request id mismatch).
  useEffect(() => {
    const loadKey = `${reloadKey}:${initialPetId ?? ''}`
    if (initializedLoadKeyRef.current === loadKey) return
    initializedLoadKeyRef.current = loadKey

    const requestId = ++loadRequestIdRef.current
    const isCurrentLoad = () => requestId === loadRequestIdRef.current
    fetchingIdsRef.current.clear()

    // Read decisions at load time instead of depending on them, so liking or passing
    // doesn't re-run the initial load and replace the pre-fetched stack.
    const { liked, passed } = useMatchStore.getState()
    const unviewed = mockPets.filter(
      (p) => !liked.includes(p.id) && !passed.includes(p.id),
    )

    let candidates = unviewed
    if (initialPetId && unviewed.some((p) => p.id === initialPetId)) {
      const priority = unviewed.find((p) => p.id === initialPetId)!
      const rest = unviewed.filter((p) => p.id !== initialPetId)
      candidates = [priority, ...rest]
    }

    const initialBatch = candidates.slice(0, BUFFER_SIZE)
    if (initialBatch.length === 0) {
      Promise.resolve().then(() => {
        if (isCurrentLoad()) {
          setStack([])
          setIsLoading(false)
        }
      })
      return
    }

    initialBatch.forEach((p) => fetchingIdsRef.current.add(p.id))

    Promise.all(initialBatch.map((p) => getPetWithLiveImage(p.id)))
      .then((pets) => {
        if (isCurrentLoad()) setStack(pets)
      })
      .catch((err: unknown) => {
        if (isCurrentLoad()) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (isCurrentLoad()) {
          setIsLoading(false)
          initialBatch.forEach((p) => fetchingIdsRef.current.delete(p.id))
        }
      })
  }, [initialPetId, reloadKey])

  // Background replenishment: maintain BUFFER_SIZE items in stack
  useEffect(() => {
    if (isLoading) return
    if (stack.length >= BUFFER_SIZE) return

    const activeAndBufferedIds = new Set([
      ...stack.map((p) => p.id),
      ...fetchingIdsRef.current,
      ...liked,
      ...passed,
    ])

    const candidate = mockPets.find((p) => !activeAndBufferedIds.has(p.id))
    if (!candidate) return

    fetchingIdsRef.current.add(candidate.id)
    getPetWithLiveImage(candidate.id)
      .then((newPet) => {
        setStack((prev) => {
          if (prev.some((p) => p.id === newPet.id)) return prev
          if (prev.length >= BUFFER_SIZE) return prev
          return [...prev, newPet]
        })
      })
      .catch((err) => {
        console.warn('Failed to replenish pet buffer from Dog API:', err)
      })
      .finally(() => {
        fetchingIdsRef.current.delete(candidate.id)
      })
  }, [stack, isLoading, liked, passed])

  const refreshPhoto = useCallback(async () => {
    if (stack.length === 0) return
    setIsRefreshing(true)
    try {
      const liveImageUrl = await fetchRandomDogImage()
      await preloadImage(liveImageUrl)
      setStack((prev) =>
        prev.map((p, i) => (i === 0 ? { ...p, image: liveImageUrl } : p)),
      )
    } catch (err: unknown) {
      console.warn('Could not refresh photo from Dog API:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [stack.length])

  const like = useCallback(() => {
    if (stack.length === 0) return
    const current = stack[0]
    likePet(current.id)
    setStack((prev) => prev.slice(1))
  }, [stack, likePet])

  const pass = useCallback(() => {
    if (stack.length === 0) return
    const current = stack[0]
    passPet(current.id)
    setStack((prev) => prev.slice(1))
  }, [stack, passPet])

  const reload = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setStack([])
    setReloadKey((k) => k + 1)
  }, [])

  const totalRemaining = mockPets.filter(
    (p) => !liked.includes(p.id) && !passed.includes(p.id),
  ).length

  return {
    pet: stack[0] ?? null,
    nextPet: stack[1] ?? null,
    stack,
    bufferedCount: stack.length,
    remainingCount: totalRemaining,
    isLoading,
    isRefreshing,
    error,
    like,
    pass,
    refreshPhoto,
    reload,
  }
}
