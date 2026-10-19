import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useMatchStore } from './stores/matchStore'
import * as petProvider from './services/petProvider'

function mockLivePets() {
  return vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
    id,
    name: id === 1 ? 'Luna' : `Pet ${id}`,
    bio: [`Bio for pet ${id}`, 'Bio 2', 'Bio 3'],
    image: `https://images.dog.ceo/breeds/mix/dog${id}.jpg`,
  }))
}

describe('App', () => {
  beforeEach(() => {
    useMatchStore.setState({ liked: [], passed: [] })
    vi.restoreAllMocks()
  })

  it('renders the app title and the top pet card when loaded', async () => {
    mockLivePets()

    render(<App />)
    expect(screen.getByRole('heading', { name: 'PawsMatch' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Buscando perritos…')

    expect(await screen.findByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.getByText('Bio for pet 1')).toBeInTheDocument()
  })

  it('opens the adoption screen when Adoptar is clicked, then returns to the next pet', async () => {
    const user = userEvent.setup()
    mockLivePets()

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Adoptar: Luna' }))

    expect(await screen.findByRole('heading', { name: 'Luna te está esperando' })).toBeInTheDocument()
    expect(useMatchStore.getState().liked).toEqual([1])
    expect(screen.getByRole('button', { name: 'Agendar visita' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Seguir explorando' }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Luna te está esperando' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('heading', { name: 'Pet 2' })).toBeInTheDocument()
  })

  it('shows the next pet when Pasar is clicked', async () => {
    const user = userEvent.setup()
    mockLivePets()

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Pasar: Luna' }))

    expect(await screen.findByRole('heading', { name: 'Pet 2' })).toBeInTheDocument()
    expect(useMatchStore.getState().passed).toEqual([1])
  })

  it('renders an error state and recovers with Reintentar', async () => {
    const user = userEvent.setup()
    mockLivePets().mockRejectedValueOnce(new Error('Network failure'))

    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar a los perritos')

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
