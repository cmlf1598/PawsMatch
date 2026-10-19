import type { Pet } from '../types/pet'

export interface PetCardProps {
  pet: Pet
  onLike?: () => void
  onPass?: () => void
}

export function PetCard({ pet, onLike, onPass }: PetCardProps) {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300">
      <div className="relative h-80 w-full overflow-hidden bg-amber-100">
        <img
          src={pet.image}
          alt={pet.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-amber-950">{pet.name}</h2>
        <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-amber-900/80">
          {pet.bio.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {(onLike || onPass) && (
          <div className="mt-6 flex items-center justify-center gap-4">
            {onPass && (
              <button
                type="button"
                onClick={onPass}
                className="flex items-center justify-center rounded-full bg-rose-100 px-6 py-2.5 font-medium text-rose-700 hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 active:scale-95 transition"
                aria-label={`Pass on ${pet.name}`}
              >
                Pass
              </button>
            )}
            {onLike && (
              <button
                type="button"
                onClick={onLike}
                className="flex items-center justify-center rounded-full bg-emerald-100 px-6 py-2.5 font-medium text-emerald-700 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 transition"
                aria-label={`Like ${pet.name}`}
              >
                Like
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

