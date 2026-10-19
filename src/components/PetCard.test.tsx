import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PetCard, FALLBACK_IMAGE } from './PetCard'
import type { Pet } from '../types/pet'

const samplePet: Pet = {
  id: 1,
  name: 'Luna',
  bio: ['Line 1', 'Line 2', 'Line 3'],
  image: 'https://images.dog.ceo/breeds/mix/dog1.jpg',
}

describe('PetCard', () => {
  it('renders pet name, image and bio lines', () => {
    render(<PetCard pet={samplePet} />)

    expect(screen.getByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Foto de Luna' })).toHaveAttribute('src', samplePet.image)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
    expect(screen.getByText('Line 3')).toBeInTheDocument()
  })

  it('calls onLike once the card has flown out after clicking Adoptar', async () => {
    const user = userEvent.setup()
    const handleLike = vi.fn()

    render(<PetCard pet={samplePet} onLike={handleLike} />)
    await user.click(screen.getByRole('button', { name: 'Adoptar: Luna' }))

    await waitFor(() => expect(handleLike).toHaveBeenCalledOnce())
  })

  it('calls onPass once the card has flown out after clicking Pasar', async () => {
    const user = userEvent.setup()
    const handlePass = vi.fn()

    render(<PetCard pet={samplePet} onPass={handlePass} />)
    await user.click(screen.getByRole('button', { name: 'Pasar: Luna' }))

    await waitFor(() => expect(handlePass).toHaveBeenCalledOnce())
  })

  it('ignores repeated clicks while the card is leaving', async () => {
    const user = userEvent.setup()
    const handleLike = vi.fn()

    render(<PetCard pet={samplePet} onLike={handleLike} />)
    const likeButton = screen.getByRole('button', { name: 'Adoptar: Luna' })
    await user.click(likeButton)
    await user.click(likeButton)

    await waitFor(() => expect(handleLike).toHaveBeenCalledOnce())
  })

  it('renders no actions when used as a background card', () => {
    render(<PetCard pet={samplePet} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders and triggers onRefreshPhoto button', async () => {
    const user = userEvent.setup()
    const handleRefresh = vi.fn()

    render(<PetCard pet={samplePet} onRefreshPhoto={handleRefresh} />)
    await user.click(screen.getByRole('button', { name: 'Ver otra foto' }))

    expect(handleRefresh).toHaveBeenCalledOnce()
  })

  it('falls back to FALLBACK_IMAGE on image loading error', () => {
    render(<PetCard pet={samplePet} />)
    const img = screen.getByRole('img', { name: 'Foto de Luna' })

    fireEvent.error(img)
    expect(img).toHaveAttribute('src', FALLBACK_IMAGE)
  })
})
