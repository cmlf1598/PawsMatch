import petsData from './pets.json'
import type { Pet } from '../types/pet'

export const mockPets: Pet[] = petsData as Pet[]
export const pets: Pet[] = mockPets
export const mockData: Pet[] = mockPets

export default mockPets

