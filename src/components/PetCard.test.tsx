import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PetCard } from './PetCard'
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
    expect(screen.getByRole('img', { name: 'Luna' })).toHaveAttribute('src', samplePet.image)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
    expect(screen.getByText('Line 3')).toBeInTheDocument()
  })

  it('calls onLike when Like button is clicked', async () => {
    const user = userEvent.setup()
    const handleLike = vi.fn()

    render(<PetCard pet={samplePet} onLike={handleLike} />)
    const likeButton = screen.getByRole('button', { name: /like luna/i })
    await user.click(likeButton)

    expect(handleLike).toHaveBeenCalledOnce()
  })

  it('calls onPass when Pass button is clicked', async () => {
    const user = userEvent.setup()
    const handlePass = vi.fn()

    render(<PetCard pet={samplePet} onPass={handlePass} />)
    const passButton = screen.getByRole('button', { name: /pass on luna/i })
    await user.click(passButton)

    expect(handlePass).toHaveBeenCalledOnce()
  })
})

