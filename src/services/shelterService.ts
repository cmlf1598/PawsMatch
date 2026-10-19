import { shelters } from '../data/shelters'
import type { Pet } from '../types/pet'
import type { Shelter, VisitDay } from '../types/shelter'

const SLOT_MINUTES = 60

/** Each pet is housed at one shelter; assignment is deterministic by id. */
export function getShelterForPet(petId: Pet['id']): Shelter {
  return shelters[(petId - 1) % shelters.length]
}

export function getMapsUrl(shelter: Shelter): string {
  const query = `${shelter.address}, ${shelter.city}, Guatemala`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/**
 * Lists the visit slots for the next `days` days, starting tomorrow so a same-day
 * slot is never already in the past. Days the shelter is closed are skipped.
 */
export function getVisitSlots(shelter: Shelter, from: Date, days = 7): VisitDay[] {
  const visitDays: VisitDay[] = []
  for (let offset = 1; offset <= days; offset++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    const hours = shelter.visitingHours.find((range) => range.days.includes(date.getDay()))
    if (hours) visitDays.push({ date, times: getHourlySlots(hours.opens, hours.closes) })
  }
  return visitDays
}

function getHourlySlots(opens: string, closes: string): string[] {
  const times: string[] = []
  for (let start = toMinutes(opens); start + SLOT_MINUTES <= toMinutes(closes); start += SLOT_MINUTES) {
    times.push(fromMinutes(start))
  }
  return times
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function fromMinutes(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}
