import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  CalendarCheck,
  Check,
  ChevronLeft,
  Clock,
  Heart,
  Mail,
  MapPin,
  Navigation,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import { AppBackground } from './AppBackground'
import { FALLBACK_IMAGE } from './PetCard'
import { ScheduleVisitSheet } from './ScheduleVisitSheet'
import { getMapsUrl, getShelterForPet } from '../services/shelterService'
import { formatLongDate, formatTime } from '../utils/format'
import type { Pet } from '../types/pet'
import type { ScheduledVisit } from '../types/shelter'

interface AdoptionDetailsProps {
  pet: Pet
  onKeepBrowsing: () => void
}

export function AdoptionDetails({ pet, onKeepBrowsing }: AdoptionDetailsProps) {
  const shelter = getShelterForPet(pet.id)
  const [isScheduling, setIsScheduling] = useState(false)
  const [visit, setVisit] = useState<ScheduledVisit | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const hasFocusedRef = useRef(false)

  // One-time focus move so screen readers announce the new screen; the guard keeps
  // StrictMode from repeating it.
  useEffect(() => {
    if (hasFocusedRef.current) return
    hasFocusedRef.current = true
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  function handleConfirmVisit(scheduled: ScheduledVisit) {
    setVisit(scheduled)
    setIsScheduling(false)
  }

  return (
    <motion.div
      className="fixed inset-0 z-20 bg-stone-950 text-white"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
    >
      <AppBackground />

      <div className="relative h-full overflow-y-auto" inert={isScheduling}>
        <div className="sticky top-0 z-10 border-b border-white/10 bg-stone-950/60 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center gap-1 px-2">
            <button
              type="button"
              onClick={onKeepBrowsing}
              aria-label="Volver"
              className="flex size-11 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft aria-hidden="true" className="size-6" />
            </button>
            <p className="font-semibold">Adopción</p>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 pt-2 pb-48">
          <div className="relative h-72 overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl shadow-black/40">
            <img
              src={pet.image}
              alt={`Foto de ${pet.name}`}
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) event.currentTarget.src = FALLBACK_IMAGE
              }}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80"
            />
            <div className="absolute inset-x-5 bottom-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Heart aria-hidden="true" className="size-3.5 text-rose-400" fill="currentColor" />
                ¡Es un match!
              </span>
              <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-bold tracking-tight outline-none">
                {pet.name} te está esperando
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Visita el refugio para conocer a {pet.name} en persona. El equipo te acompañará en todo el
            proceso de adopción.
          </p>

          {visit && (
            <div
              role="status"
              className="mt-4 flex gap-3 rounded-3xl border border-emerald-400/30 bg-emerald-500/15 p-4 backdrop-blur-xl"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <Check aria-hidden="true" className="size-5" strokeWidth={3} />
              </span>
              <div>
                <p className="font-semibold">¡Visita agendada!</p>
                <p className="mt-0.5 text-sm text-white/75">
                  Te esperamos el {formatLongDate(visit.date)} {visit.time.startsWith('13:') ? 'a la' : 'a las'}{' '}
                  {formatTime(visit.time)} en {shelter.name}.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <InfoSection icon={Building2} title="Refugio">
              <p className="text-lg font-semibold">{shelter.name}</p>
            </InfoSection>

            <InfoSection icon={MapPin} title="Ubicación">
              <p>{shelter.address}</p>
              <p className="text-white/70">{shelter.city}</p>
              <a
                href={getMapsUrl(shelter)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                <Navigation aria-hidden="true" className="size-4" />
                Cómo llegar
              </a>
            </InfoSection>

            <InfoSection icon={Phone} title="Contacto">
              <a
                href={`tel:${shelter.phone.replaceAll(' ', '')}`}
                className="flex items-center gap-2 py-1 hover:text-amber-200"
              >
                <Phone aria-hidden="true" className="size-4 text-white/60" />
                {shelter.phone}
              </a>
              <a href={`mailto:${shelter.email}`} className="flex items-center gap-2 py-1 break-all hover:text-amber-200">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-white/60" />
                {shelter.email}
              </a>
            </InfoSection>

            <InfoSection icon={Clock} title="Horario de visitas">
              <dl className="space-y-1.5">
                {shelter.visitingHours.map((hours) => (
                  <div key={hours.label} className="flex justify-between gap-4">
                    <dt className="text-white/70">{hours.label}</dt>
                    <dd className="text-right font-medium">
                      {formatTime(hours.opens)} – {formatTime(hours.closes)}
                    </dd>
                  </div>
                ))}
              </dl>
            </InfoSection>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-stone-950/60 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto flex max-w-md flex-col gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsScheduling(true)}
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <CalendarCheck aria-hidden="true" className="size-5" />
              {visit ? 'Cambiar visita' : 'Agendar visita'}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onKeepBrowsing}
              className="h-12 rounded-full border border-white/20 bg-white/10 font-semibold backdrop-blur-md transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Seguir explorando
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isScheduling && (
          <ScheduleVisitSheet
            shelter={shelter}
            petName={pet.name}
            onClose={() => setIsScheduling(false)}
            onConfirm={handleConfirmVisit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface InfoSectionProps {
  icon: LucideIcon
  title: string
  children: ReactNode
}

function InfoSection({ icon: Icon, title, children }: InfoSectionProps) {
  return (
    <section className="rounded-3xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-xl">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
        <Icon aria-hidden="true" className="size-4 text-amber-300" />
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}
