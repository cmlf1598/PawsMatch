import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'PawsMatch' })).toBeInTheDocument()
  })

  it('renders the pet card once pets have loaded', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Luna' })).toBeInTheDocument()
    })
  })
})
