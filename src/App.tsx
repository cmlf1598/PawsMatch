import { useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { AdoptionDetails } from './components/AdoptionDetails'
import { AppBackground } from './components/AppBackground'
import { DeckScreen } from './components/DeckScreen'
import type { Pet } from './types/pet'

export default function App() {
  const [adoptingPet, setAdoptingPet] = useState<Pet | null>(null)

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-dvh overflow-hidden bg-stone-950 text-white">
        <AppBackground />

        {/* The deck stays mounted under the adoption screen so its pre-fetched stack survives. */}
        <div className="relative h-full" inert={adoptingPet !== null}>
          <DeckScreen onAdopt={setAdoptingPet} />
        </div>

        <AnimatePresence>
          {adoptingPet && (
            <AdoptionDetails
              key={adoptingPet.id}
              pet={adoptingPet}
              onKeepBrowsing={() => setAdoptingPet(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
