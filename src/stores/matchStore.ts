import { create } from 'zustand'
import type { Pet } from '../types/pet'

interface MatchState {
  liked: Pet['id'][]
  passed: Pet['id'][]
  like: (petId: Pet['id']) => void
  pass: (petId: Pet['id']) => void
}

export const useMatchStore = create<MatchState>()((set) => ({
  liked: [],
  passed: [],
  like: (petId) => set((state) => ({ liked: [...state.liked, petId] })),
  pass: (petId) => set((state) => ({ passed: [...state.passed, petId] })),
}))
