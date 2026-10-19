import { useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import type { Pet } from '../types/pet'

export interface PetCardProps {
  pet: Pet
  onLike?: () => void
  onPass?: () => void
}

export const FALLBACK_IMAGE = 'https://images.dog.ceo/breeds/mix/dog1.jpg'

const SWIPE_DISTANCE = 110
const SWIPE_VELOCITY = 600
const FLY_OUT_DISTANCE = 640

type Decision = 'like' | 'pass'

export function PetCard({ pet, onLike, onPass }: PetCardProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-FLY_OUT_DISTANCE, 0, FLY_OUT_DISTANCE], [-24, 0, 24])
  const likeStampOpacity = useTransform(x, [24, SWIPE_DISTANCE], [0, 1])
  const passStampOpacity = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0])

  const isInteractive = Boolean(onLike || onPass)

  // Derive the active image URL directly from props and error state
  const isFailed = failedImage === pet.image
  const displayImage = isFailed ? FALLBACK_IMAGE : pet.image

  // Buttons and swipes share one path: fly the card off-screen, then report the decision.
  function decide(decision: Decision) {
    const handler = decision === 'like' ? onLike : onPass
    if (!handler || isLeaving) return
    setIsLeaving(true)
    navigator.vibrate?.(12)
    const direction = decision === 'like' ? 1 : -1
    animate(x, direction * FLY_OUT_DISTANCE, { duration: 0.32, ease: [0.4, 0, 1, 1] }).then(handler)
  }

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) decide('like')
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) decide('pass')
  }

  return (
    <motion.article
      drag={isInteractive && !isLeaving ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className={`relative h-full w-full overflow-hidden rounded-[2rem] border border-white/20 bg-stone-900 shadow-2xl shadow-black/50 select-none ${
        isInteractive ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <img
        key={pet.image}
        src={displayImage}
        alt={`Foto de ${pet.name}`}
        draggable={false}
        onError={() => {
          setFailedImage(pet.image)
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/80"
      />

      {isInteractive && (
        <>
          <motion.div
            aria-hidden="true"
            style={{ opacity: likeStampOpacity }}
            className="pointer-events-none absolute top-20 left-6 -rotate-12 rounded-2xl border-4 border-emerald-400 px-4 py-1 text-3xl font-black tracking-wider text-emerald-400 uppercase"
          >
            Adoptar
          </motion.div>
          <motion.div
            aria-hidden="true"
            style={{ opacity: passStampOpacity }}
            className="pointer-events-none absolute top-20 right-6 rotate-12 rounded-2xl border-4 border-rose-400 px-4 py-1 text-3xl font-black tracking-wider text-rose-400 uppercase"
          >
            Pasar
          </motion.div>
        </>
      )}

      <div className="absolute inset-x-3 bottom-3 rounded-3xl border border-white/20 bg-white/10 p-5 text-white shadow-lg backdrop-blur-xl">
        <h2 className="text-3xl font-bold tracking-tight">{pet.name}</h2>
        <div className="mt-2 space-y-1 text-sm leading-snug text-white/85">
          {pet.bio.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {isInteractive && (
          <div className="mt-5 flex items-center gap-3">
            {onPass && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => decide('pass')}
                disabled={isLeaving}
                aria-label={`Pasar: ${pet.name}`}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 font-semibold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X aria-hidden="true" className="size-6 text-rose-300" strokeWidth={2.75} />
                Pasar
              </motion.button>
            )}
            {onLike && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => decide('like')}
                disabled={isLeaving}
                aria-label={`Adoptar: ${pet.name}`}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Heart aria-hidden="true" className="size-6" fill="currentColor" />
                Adoptar
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
