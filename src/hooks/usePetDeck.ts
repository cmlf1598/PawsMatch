import { useEffect, useRef, useState } from 'react'
import { getPets } from '../services/petService'
import { useMatchStore } from '../stores/matchStore'
import type { Pet } from '../types/pet'

export function usePetDeck() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const liked = useMatchStore((state) => state.liked)
  const passed = useMatchStore((state) => state.passed)
  const likePet = useMatchStore((state) => state.like)
  const passPet = useMatchStore((state) => state.pass)
  const hasLoadedRef = useRef(false)

  // One-time load. The ref guard stops StrictMode's double effect run from fetching twice.
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    getPets()
      .then(setPets)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Derived from the store rather than kept as an index, so the deck resumes where it left off.
  const remainingPets = pets.filter((pet) => !liked.includes(pet.id) && !passed.includes(pet.id))
  const currentPet = remainingPets[0] ?? null

  function like() {
    if (currentPet) likePet(currentPet.id)
  }

  function pass() {
    if (currentPet) passPet(currentPet.id)
  }

  return { currentPet, remainingCount: remainingPets.length, isLoading, error, like, pass }
}
