import { useEffect, useRef, useState } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { CalendarCheck } from 'lucide-react'
import { getVisitSlots } from '../services/shelterService'
import { formatDayParts, formatLongDate, formatTime } from '../utils/format'
import type { ScheduledVisit, Shelter } from '../types/shelter'

interface ScheduleVisitSheetProps {
  shelter: Shelter
  petName: string
  onClose: () => void
  onConfirm: (visit: ScheduledVisit) => void
}

const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 600

export function ScheduleVisitSheet({ shelter, petName, onClose, onConfirm }: ScheduleVisitSheetProps) {
  const [visitDays] = useState(() => getVisitSlots(shelter, new Date()))
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const hasFocusedRef = useRef(false)
  const selectedDay = visitDays[selectedDayIndex]

  // One-time focus move into the dialog; the guard keeps StrictMode from repeating it.
  useEffect(() => {
    if (hasFocusedRef.current) return
    hasFocusedRef.current = true
    sheetRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y > DISMISS_DISTANCE || info.velocity.y > DISMISS_VELOCITY) onClose()
  }

  function handleConfirm() {
    if (selectedDay && selectedTime) onConfirm({ date: selectedDay.date, time: selectedTime })
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-visit-title"
        tabIndex={-1}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="absolute inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-[2rem] border border-white/15 bg-stone-900/80 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-2xl backdrop-blur-2xl outline-none"
      >
        <div aria-hidden="true" className="mx-auto h-1.5 w-12 rounded-full bg-white/30" />
        <h2 id="schedule-visit-title" className="mt-4 text-xl font-bold">
          Agendar visita
        </h2>
        <p className="mt-1 text-sm text-white/65">
          Elige cuándo quieres conocer a {petName} en {shelter.name}.
        </p>

        {visitDays.length === 0 ? (
          <p className="mt-6 text-sm text-white/80">
            No hay horarios disponibles esta semana. Comunícate con el refugio para coordinar tu visita.
          </p>
        ) : (
          <>
            <h3 className="mt-5 text-xs font-semibold tracking-wide text-white/60 uppercase">Día</h3>
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
              {visitDays.map((day, index) => {
                const parts = formatDayParts(day.date)
                const isSelected = index === selectedDayIndex
                return (
                  <button
                    key={day.date.toISOString()}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={formatLongDate(day.date)}
                    onClick={() => {
                      setSelectedDayIndex(index)
                      setSelectedTime(null)
                    }}
                    className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2 transition focus-visible:outline-2 focus-visible:outline-white ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/25'
                        : 'border-white/15 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs text-white/70 capitalize">{parts.weekday}</span>
                    <span className="text-xl font-bold">{parts.day}</span>
                    <span className="text-xs text-white/60">{parts.month}</span>
                  </button>
                )
              })}
            </div>

            <h3 className="mt-5 text-xs font-semibold tracking-wide text-white/60 uppercase">Hora</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {selectedDay?.times.map((time) => {
                const isSelected = time === selectedTime
                return (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedTime(time)}
                    className={`h-11 rounded-xl border text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-white ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/25'
                        : 'border-white/15 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={!selectedTime}
              onClick={handleConfirm}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
            >
              <CalendarCheck aria-hidden="true" className="size-5" />
              Confirmar visita
            </button>
          </>
        )}
      </motion.div>
    </>
  )
}
