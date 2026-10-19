import { describe, it, expect } from 'vitest'
import { getMapsUrl, getShelterForPet, getVisitSlots } from './shelterService'
import { shelters } from '../data/shelters'
import type { Shelter } from '../types/shelter'

const weekdayShelter: Shelter = {
  id: 'test',
  name: 'Refugio de prueba',
  address: '1a Calle 1-01, Zona 1',
  city: 'Ciudad de Guatemala',
  phone: '+502 0000 0000',
  email: 'test@refugio.example',
  visitingHours: [
    { label: 'Lunes a viernes', days: [1, 2, 3, 4, 5], opens: '09:00', closes: '12:00' },
    { label: 'Sábado', days: [6], opens: '10:00', closes: '11:00' },
  ],
}

describe('shelterService', () => {
  it('assigns every pet a shelter, cycling through the shelters by id', () => {
    expect(getShelterForPet(1)).toBe(shelters[0])
    expect(getShelterForPet(2)).toBe(shelters[1])
    expect(getShelterForPet(shelters.length + 1)).toBe(shelters[0])
  })

  it('builds a Google Maps search URL for the shelter address', () => {
    const url = getMapsUrl(weekdayShelter)
    expect(url).toContain('https://www.google.com/maps/search/?api=1&query=')
    expect(decodeURIComponent(url)).toContain('1a Calle 1-01, Zona 1, Ciudad de Guatemala, Guatemala')
  })

  it('lists one-hour slots starting tomorrow and skips closed days', () => {
    // Saturday 2026-10-17 → next 7 days run Sunday 18 to Saturday 24.
    const slots = getVisitSlots(weekdayShelter, new Date(2026, 9, 17, 15, 30))

    expect(slots.map((day) => day.date.getDate())).toEqual([19, 20, 21, 22, 23, 24])
    expect(slots[0].times).toEqual(['09:00', '10:00', '11:00'])
    expect(slots.at(-1)?.times).toEqual(['10:00'])
  })
})
