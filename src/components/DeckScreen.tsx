import { motion } from 'framer-motion'
import { CircleAlert, Heart, PawPrint, RotateCcw, Sparkles } from 'lucide-react'
import { PetCard } from './PetCard'
import { useLivePet } from '../hooks/useLivePet'
import { useMatchStore } from '../stores/matchStore'
import type { Pet } from '../types/pet'

interface DeckScreenProps {
  onAdopt: (pet: Pet) => void
}

const glassPanel =
  'rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl'
const primaryButton =
  'mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95'

export function DeckScreen({ onAdopt }: DeckScreenProps) {
  const likedCount = useMatchStore((state) => state.liked.length)
  const passedCount = useMatchStore((state) => state.passed.length)
  const {
    stack,
    pet,
    remainingCount,
    isLoading,
    error,
    like,
    pass,
    reload,
  } = useLivePet()

  function handleLike() {
    if (!pet) return
    like()
    onAdopt(pet)
  }

  function handleStartOver() {
    useMatchStore.setState({ liked: [], passed: [] })
    reload()
  }

  // Top card last so it paints above the card peeking from behind.
  const visibleCards = stack.slice(0, 2).reverse()

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            <PawPrint aria-hidden="true" className="size-6 text-amber-300" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">PawsMatch</h1>
            <p className="text-xs text-white/60">Encuentra a tu nuevo mejor amigo</p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
          <Heart aria-hidden="true" className="size-4 text-rose-400" fill="currentColor" />
          <span className="sr-only">Te gustaron:</span>
          {likedCount}
        </p>
      </header>

      <main className="relative mt-3 min-h-0 flex-1 pb-6">
        {isLoading && (
          <div
            role="status"
            className={`flex h-full flex-col items-center justify-center gap-4 ${glassPanel} animate-pulse`}
          >
            <PawPrint aria-hidden="true" className="size-12 animate-bounce text-amber-300" />
            <p className="text-sm font-medium text-white/80">Buscando perritos…</p>
          </div>
        )}

        {!isLoading && error && (
          <div
            role="alert"
            className={`flex h-full flex-col items-center justify-center p-8 text-center ${glassPanel}`}
          >
            <CircleAlert aria-hidden="true" className="size-12 text-rose-300" />
            <h2 className="mt-4 text-xl font-bold">No pudimos cargar a los perritos</h2>
            <p className="mt-2 text-sm text-white/70">Revisa tu conexión e inténtalo de nuevo.</p>
            <button type="button" onClick={reload} className={primaryButton}>
              <RotateCcw aria-hidden="true" className="size-5" />
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && pet && (
          <div className="relative h-full">
            {visibleCards.map((stackPet) => {
              const isTop = stackPet.id === pet.id
              return (
                <motion.div
                  key={stackPet.id}
                  className="absolute inset-0"
                  initial={{ scale: 0.9, y: 40, opacity: 0 }}
                  animate={isTop ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.95, y: 24, opacity: 0.6 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  aria-hidden={!isTop}
                  inert={!isTop}
                >
                  {isTop ? (
                    <PetCard pet={stackPet} onLike={handleLike} onPass={pass} />
                  ) : (
                    <PetCard pet={stackPet} />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {!isLoading && !error && !pet && (
          <div className={`flex h-full flex-col items-center justify-center p-8 text-center ${glassPanel}`}>
            <Sparkles aria-hidden="true" className="size-12 text-amber-300" />
            <h2 className="mt-4 text-2xl font-bold">¡Ya conociste a todos!</h2>
            <p className="mt-2 text-sm text-white/70">
              Te gustaron {likedCount} y pasaste {passedCount}. Empieza de nuevo para volver a verlos.
            </p>
            <button type="button" onClick={handleStartOver} className={primaryButton}>
              <RotateCcw aria-hidden="true" className="size-5" />
              Empezar de nuevo
            </button>
          </div>
        )}
      </main>

      {!isLoading && !error && pet && (
        <footer className="text-center text-xs text-white/50">
          <p>Desliza a la derecha para adoptar o a la izquierda para pasar</p>
          <p className="mt-0.5">
            {remainingCount === 1 ? 'Queda 1 perrito' : `Quedan ${remainingCount} perritos`}
          </p>
        </footer>
      )}
    </div>
  )
}
