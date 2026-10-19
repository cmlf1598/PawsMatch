import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdoptionDetails } from './AdoptionDetails'
import { getShelterForPet } from '../services/shelterService'
import type { Pet } from '../types/pet'

const luna: Pet = {
  id: 1,
  name: 'Luna',
  bio: ['Line 1', 'Line 2', 'Line 3'],
  image: 'https://images.dog.ceo/breeds/mix/dog1.jpg',
}
const shelter = getShelterForPet(luna.id)

describe('AdoptionDetails', () => {
  it('shows the shelter contact info, location and visiting hours', () => {
    render(<AdoptionDetails pet={luna} onKeepBrowsing={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Luna te está esperando' })).toBeInTheDocument()
    expect(screen.getByText(shelter.name)).toBeInTheDocument()
    expect(screen.getByText(shelter.address)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps'),
    )
    expect(screen.getByRole('link', { name: shelter.phone })).toHaveAttribute(
      'href',
      `tel:${shelter.phone.replaceAll(' ', '')}`,
    )
    expect(screen.getByRole('link', { name: shelter.email })).toHaveAttribute('href', `mailto:${shelter.email}`)
    for (const hours of shelter.visitingHours) {
      expect(screen.getByText(hours.label)).toBeInTheDocument()
    }
  })

  it('schedules a visit from the bottom sheet', async () => {
    const user = userEvent.setup()
    render(<AdoptionDetails pet={luna} onKeepBrowsing={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Agendar visita' }))
    const dialog = screen.getByRole('dialog', { name: 'Agendar visita' })
    const confirmButton = within(dialog).getByRole('button', { name: 'Confirmar visita' })
    expect(confirmButton).toBeDisabled()

    // Every open day at this shelter starts at 9:00.
    await user.click(within(dialog).getByRole('button', { name: /^9:00/ }))
    await user.click(confirmButton)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent('¡Visita agendada!')
    expect(screen.getByRole('button', { name: 'Cambiar visita' })).toBeInTheDocument()
  })

  it('closes the scheduling sheet with Escape', async () => {
    const user = userEvent.setup()
    render(<AdoptionDetails pet={luna} onKeepBrowsing={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Agendar visita' }))
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns to the deck with Seguir explorando or the back button', async () => {
    const user = userEvent.setup()
    const handleKeepBrowsing = vi.fn()
    render(<AdoptionDetails pet={luna} onKeepBrowsing={handleKeepBrowsing} />)

    await user.click(screen.getByRole('button', { name: 'Seguir explorando' }))
    await user.click(screen.getByRole('button', { name: 'Volver' }))

    expect(handleKeepBrowsing).toHaveBeenCalledTimes(2)
  })
})
