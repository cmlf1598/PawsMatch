import { PetCard } from './components/PetCard'
import { usePetDeck } from './hooks/usePetDeck'
import { useMatchStore } from './stores/matchStore'

export default function App() {
  const likedCount = useMatchStore((state) => state.liked.length)
  const passedCount = useMatchStore((state) => state.passed.length)
  const { currentPet, remainingCount, isLoading, error, like, pass } = usePetDeck()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50 p-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-amber-900">PawsMatch</h1>
        <p className="text-amber-800">Find your new best friend.</p>
        <p className="text-sm text-amber-700">
          Liked: {likedCount} · Passed: {passedCount}
        </p>
      </header>

      {isLoading && <p className="text-amber-700">Loading pets...</p>}

      {error && (
        <p className="text-rose-600" role="alert">
          Failed to load pets: {error.message}
        </p>
      )}

      {!isLoading && !error && currentPet && (
        <div className="flex flex-col items-center gap-2">
          <PetCard pet={currentPet} onLike={like} onPass={pass} />
          <p className="text-xs text-amber-700">Remaining profiles: {remainingCount}</p>
        </div>
      )}

      {!isLoading && !error && !currentPet && (
        <p className="text-amber-800">No more pets in the deck. Check back later!</p>
      )}
    </main>
  )
}
