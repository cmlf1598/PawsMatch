import { mockPets } from '../data/mockData'
import type { Pet } from '../types/pet'

// Async so callers don't change if pets later come from a real API instead of the local JSON.
export const getPets = async (): Promise<Pet[]> => mockPets
